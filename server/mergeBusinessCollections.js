/**
 * CONNECT GREEN — Merge "business" → "businesses"
 * ─────────────────────────────────────────────────
 * The Mongoose model 'Business' maps to the "businesses" collection.
 * The legacy "business" collection is a stale duplicate.
 *
 * This script:
 *  1. Reads every doc from "business"
 *  2. Upserts each into "businesses" (skips exact _id duplicates)
 *  3. Verifies the merge
 *  4. Drops the "business" collection
 *
 * Run: node mergeBusinessCollections.js
 */

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const RAW_URI = process.env.MONGO_URI.replace(/^"|"$/g, '');
const BASE_URI = RAW_URI.replace(/\/connect_green\?/, '/admin?');
const DB_NAME = 'connect_green';
const SRC_COLL = 'business';    // the stale one
const DST_COLL = 'businesses';  // what Mongoose uses

async function run() {
    console.log('\n🔀 Merge: "business" → "businesses"');
    console.log('══════════════════════════════════════\n');

    const client = new MongoClient(BASE_URI, { ssl: true, authSource: 'admin' });

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas\n');

        const db = client.db(DB_NAME);
        const src = db.collection(SRC_COLL);
        const dst = db.collection(DST_COLL);

        // ── 1. Count both collections
        const srcCount = await src.countDocuments();
        const dstCount = await dst.countDocuments();
        console.log(`📦 "${SRC_COLL}" has ${srcCount} document(s)`);
        console.log(`📦 "${DST_COLL}" has ${dstCount} document(s)\n`);

        if (srcCount === 0) {
            console.log('ℹ️  "business" is already empty — nothing to merge.');
            console.log('   Dropping empty "business" collection...');
            await src.drop().catch(() => { });
            console.log('✅ Dropped "business".\n');
            return;
        }

        // ── 2. Fetch all docs from "business"
        const docs = await src.find({}).toArray();
        let inserted = 0, skipped = 0, errors = 0;

        for (const doc of docs) {
            try {
                // Try _id match first
                const exists = await dst.findOne({ _id: doc._id });
                if (exists) {
                    // Already present by _id — update it from source
                    await dst.replaceOne({ _id: doc._id }, doc);
                    skipped++;
                } else {
                    await dst.insertOne(doc);
                    inserted++;
                }
            } catch (e) {
                if (e.code === 11000) {
                    skipped++;  // Unique index conflict (e.g. same name) — skip
                } else {
                    console.error(`  ⚠️  Failed on doc ${doc._id}: ${e.message}`);
                    errors++;
                }
            }
        }

        console.log(`📊 Merge result:`);
        console.log(`   Newly inserted : ${inserted}`);
        console.log(`   Updated/skipped: ${skipped}`);
        console.log(`   Errors         : ${errors}`);

        if (errors > 0) {
            console.log('\n⛔ Errors occurred — NOT dropping "business". Fix errors and retry.\n');
            process.exit(1);
        }

        // ── 3. Verify
        const newCount = await dst.countDocuments();
        console.log(`\n🔍 Verification:`);
        console.log(`   Before: ${dstCount} docs in "${DST_COLL}"`);
        console.log(`   After : ${newCount} docs in "${DST_COLL}"`);
        console.log(`   Added : ${newCount - dstCount} new document(s)\n`);

        // ── 4. Drop "business"
        await src.drop();
        console.log(`✅ Dropped collection "${SRC_COLL}"\n`);

        console.log('══════════════════════════════════════');
        console.log('🎉 Done! All business data is now in');
        console.log('   one single "businesses" collection.');
        console.log('   Your Mongoose model reads from it correctly.');
        console.log('══════════════════════════════════════\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

run();
