import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const SiteManagerApply = () => {
    const [formData, setFormData] = useState({
        experienceLevel: 'beginner',
        motivation: '',
        certifications: []
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            await axios.post('/site-requests', formData, config);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    const handleCertChange = (e) => {
        setFormData({ ...formData, certifications: e.target.value.split(',').map(cert => cert.trim()) });
    };

    return (
        <div className="min-h-screen bg-[#F0A95A] py-12 px-4 sm:px-6 lg:px-8 font-['Outfit']">
            <div className="max-w-md mx-auto bg-[#F7ECD8] rounded-2xl shadow-xl overflow-hidden mt-8 border border-amber-900/10">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold font-['Calistoga'] text-[#2C5234]">
                            Apply as Site Manager
                        </h2>
                        <p className="mt-2 text-[#4A4A4A]">Help protect our natural sites</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto relative max-w-sm text-sm">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mx-auto relative max-w-sm text-sm">
                            <span className="block sm:inline">Application submitted successfully! Redirecting...</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[#2C5234] mb-2 font-['Outfit']">Experience Level</label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-amber-900/20 bg-white focus:ring-2 focus:ring-[#8E9B6C] focus:border-transparent transition-all outline-none"
                                value={formData.experienceLevel}
                                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#2C5234] mb-2 font-['Outfit']">Motivation</label>
                            <textarea
                                required
                                className="w-full px-4 py-3 rounded-lg border border-amber-900/20 bg-white focus:ring-2 focus:ring-[#8E9B6C] focus:border-transparent transition-all outline-none"
                                rows="4"
                                placeholder="Why do you want to manage sites?"
                                value={formData.motivation}
                                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#2C5234] mb-2 font-['Outfit']">Certifications (comma separated, optional)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border border-amber-900/20 bg-white focus:ring-2 focus:ring-[#8E9B6C] focus:border-transparent transition-all outline-none"
                                placeholder="e.g. CPR, Wildlife Conservation"
                                onChange={handleCertChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#E5ECE4] hover:bg-[#8E9B6C] text-[#2C5234] hover:text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg font-['Outfit']"
                        >
                            Submit Application
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SiteManagerApply;
