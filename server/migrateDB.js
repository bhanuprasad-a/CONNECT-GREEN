/**
 * CONNECT GREEN — Database Migration Script
 * ─────────────────────────────────────────
 * Copies ALL collections from "CONNECTGREEN" → "connect_green"
 * then DROPS the "CONNECTGREEN" database.
 *
 * Run: node migrateDB.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const RAW_URI = process.env.MONGO_URI.replace(/^"|"$/g, ''); // strip wrapping quotes

// Switch to admin db so we can access both databases at cluster level
const BASE_URI = RAW_URI.replace(/\/connect_green\?/, '/admin?');

const SOURCE_DB = 'CONNECTGREEN';
const TARGET_DB = 'connect_green';

async function migrateCollection(sourceColl, targetColl, collName) {
    const docs = await sourceColl.find({}).toArray();

    if (docs.length === 0) {
        console.log(`   ↷  ${collName}: (empty — skipping)`);
        return { copied: 0, skipped: 0, errors: 0 };
    }

    let copied = 0, skipped = 0, errors = 0;

    for (const doc of docs) {
        try {
            // Check if _id already exists in target
            const existing = await targetColl.findOne({ _id: doc._id });
            if (existing) {
                // Replace it completely with source version
                await targetColl.replaceOne({ _id: doc._id }, doc);
                skipped++; // counted as "updated"
            } else {
                await targetColl.insertOne(doc);
                copied++;
            }
        } catch (err) {
            if (err.code === 11000) {
                // Duplicate unique index (e.g. email) — skip safely
                skipped++;
            } else {
                console.error(`      ⚠️  Doc ${doc._id}: ${err.message}`);
                errors++;
            }
        }
    }

    return { total: docs.length, copied, skipped, errors };
}

async function migrate() {
    console.log('\n🚀 CONNECT GREEN — Database Migration');
    console.log('═══════════════════════════════════════');
    console.log(`   FROM: "${SOURCE_DB}"`);
    console.log(`   INTO: "${TARGET_DB}"`);
    console.log('═══════════════════════════════════════\n');

    const client = new MongoClient(BASE_URI, { ssl: true, authSource: 'admin' });

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas\n');

        const sourceDb = client.db(SOURCE_DB);
        const targetDb = client.db(TARGET_DB);

        // ── 1. List all source collections ──
        const collections = await sourceDb.listCollections().toArray();

        if (collections.length === 0) {
            console.log(`⚠️  "${SOURCE_DB}" has no collections. Nothing to migrate.`);
            await client.close();
            return;
        }

        console.log(`📦 Found ${collections.length} collection(s) in "${SOURCE_DB}":`);
        collections.forEach(c => console.log(`   • ${c.name}`));
        console.log();

        // ── 2. Copy each collection doc-by-doc ──
        const summary = [];
        for (const collInfo of collections) {
            const name = collInfo.name;
            process.stdout.write(`   Migrating ${name}... `);

            const result = await migrateCollection(
                sourceDb.collection(name),
                targetDb.collection(name),
                name
            );
            console.log(`✅  total=${result.total}, new=${result.copied}, updated/skipped=${result.skipped}, errors=${result.errors}`);
            summary.push({ name, ...result });

            // Recreate indexes (best effort)
            try {
                const indexes = await sourceDb.collection(name).indexes();
                for (const idx of indexes) {
                    if (idx.name === '_id_') continue;
                    const { key, name: idxName, ns, v, ...opts } = idx;
                    await targetDb.collection(name).createIndex(key, { ...opts, name: idxName }).catch(() => { });
                }
            } catch (_) { }
        }

        // ── 3. Verification ──
        console.log('\n🔍 Verification:');
        let allOk = true;
        for (const collInfo of collections) {
            const srcCount = await sourceDb.collection(collInfo.name).countDocuments();
            const tgtCount = await targetDb.collection(collInfo.name).countDocuments();
            // Target can have MORE docs (from seedAll) — that's fine
            const ok = tgtCount >= srcCount;
            console.log(`   ${ok ? '✅' : '❌'} ${collInfo.name}: source=${srcCount} → target=${tgtCount}`);
            if (!ok) allOk = false;
        }

        if (!allOk) {
            console.log('\n⛔ Some collections have fewer docs than source. NOT dropping source DB.');
            console.log('   Check errors above and re-run the script.\n');
            await client.close();
            process.exit(1);
        }

        // ── 4. Drop CONNECTGREEN ──
        console.log(`\n🗑  All verified. Dropping "${SOURCE_DB}"...`);
        await sourceDb.dropDatabase();
        console.log(`✅ "${SOURCE_DB}" dropped.\n`);

        console.log('═══════════════════════════════════════');
        console.log('🎉 Migration complete!');
        console.log(`   Active database: "${TARGET_DB}"`);
        console.log(`   MONGO_URI in .env already points → connect_green ✓`);
        console.log('═══════════════════════════════════════\n');

    } catch (err) {
        console.error('\n❌ Fatal error:', err.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

migrate();
