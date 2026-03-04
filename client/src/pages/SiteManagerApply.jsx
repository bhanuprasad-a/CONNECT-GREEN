import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { CheckCircle, Users, TreePine, ShieldCheck, AlertCircle, MapPin, Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const SiteManagerApply = () => {
    const [formData, setFormData] = useState({
        experienceLevel: '',
        motivation: '',
        certifications: [],
        sitePreference: '',
        availability: '',
        emergencyHandling: '',
        conservationKnowledge: '',
        physicalFitness: '',
        communicationSkills: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [progress, setProgress] = useState(0);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate all fields are filled
        const requiredFields = ['experienceLevel', 'motivation', 'sitePreference', 'availability', 
                               'emergencyHandling', 'conservationKnowledge', 'physicalFitness', 'communicationSkills'];
        const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
        
        if (missingFields.length > 0) {
            setError(`Please complete all required fields before submitting.`);
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            await axios.post('/site-requests', formData, config);
            setSuccess(true);
            toast.success('Application submitted successfully!');
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            toast.error('Failed to submit application');
        }
    };

    const questions = [
        {
            id: 'experienceLevel',
            question: 'What is your experience level in conservation or site management?',
            type: 'radio',
            options: [
                { value: 'beginner', label: 'Beginner (0-2 years)', icon: <TreePine size={16} /> },
                { value: 'intermediate', label: 'Intermediate (2-5 years)', icon: <Users size={16} /> },
                { value: 'advanced', label: 'Advanced (5+ years)', icon: <Award size={16} /> }
            ]
        },
        {
            id: 'sitePreference',
            question: 'What type of natural sites are you most interested in managing?',
            type: 'radio',
            options: [
                { value: 'wildlife', label: 'Wildlife Sanctuaries', icon: <TreePine size={16} /> },
                { value: 'forest', label: 'Forest Reserves', icon: <TreePine size={16} /> },
                { value: 'wetland', label: 'Wetlands & Water Bodies', icon: <TreePine size={16} /> },
                { value: 'historical', label: 'Historical Natural Sites', icon: <MapPin size={16} /> }
            ]
        },
        {
            id: 'availability',
            question: 'What is your availability for site management?',
            type: 'radio',
            options: [
                { value: 'fulltime', label: 'Full-time (40+ hours/week)', icon: <Clock size={16} /> },
                { value: 'parttime', label: 'Part-time (20-39 hours/week)', icon: <Clock size={16} /> },
                { value: 'weekend', label: 'Weekends Only', icon: <Clock size={16} /> }
            ]
        },
        {
            id: 'emergencyHandling',
            question: 'How would you handle an emergency situation at your site (e.g., medical emergency, lost visitor)?',
            type: 'textarea',
            placeholder: 'Describe your approach to emergency situations...'
        },
        {
            id: 'conservationKnowledge',
            question: 'What conservation practices do you believe are most important for protecting natural sites?',
            type: 'textarea',
            placeholder: 'Share your conservation knowledge and philosophy...'
        },
        {
            id: 'physicalFitness',
            question: 'Site management often requires physical activity. How would you rate your physical fitness?',
            type: 'radio',
            options: [
                { value: 'excellent', label: 'Excellent - Can handle demanding physical tasks', icon: <Users size={16} /> },
                { value: 'good', label: 'Good - Can handle moderate physical activity', icon: <Users size={16} /> },
                { value: 'limited', label: 'Limited - Prefer less physically demanding roles', icon: <Users size={16} /> }
            ]
        },
        {
            id: 'communicationSkills',
            question: 'How would you educate visitors about conservation and site rules?',
            type: 'textarea',
            placeholder: 'Describe your communication approach with visitors...'
        },
        {
            id: 'motivation',
            question: 'Why do you want to become a site manager for Connect Green?',
            type: 'textarea',
            placeholder: 'Tell us about your passion for conservation...'
        }
    ];

    const totalSteps = questions.length;

    const updateProgress = () => {
        const filledFields = Object.values(formData).filter(value => 
            value !== '' && (Array.isArray(value) ? value.length > 0 : true)
        ).length;
        setProgress(Math.round((filledFields / totalSteps) * 100));
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        updateProgress();
    };

    const handleCertChange = (e) => {
        const certs = e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert);
        handleInputChange('certifications', certs);
    };

    const currentQuestion = questions[currentStep - 1];

    return (
        <div className="min-h-screen bg-darkBg text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <ShieldCheck className="text-neonGreen" size={32} />
                        <h1 className="text-4xl font-display font-bold text-white">
                            Site Manager Application
                        </h1>
                    </div>
                    <p className="text-stone-400 text-lg max-w-2xl mx-auto">
                        Join our team of conservation site managers and help protect natural ecosystems while providing amazing visitor experiences.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-stone-400">Application Progress</span>
                        <span className="text-sm text-neonGreen font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-neonGreen to-accentGreen transition-all duration-500 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-4">
                        <span className="text-xs text-stone-500">Step {currentStep} of {totalSteps}</span>
                        <span className="text-xs text-stone-500">{totalSteps - currentStep} questions remaining</span>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mb-6 bg-red-950/50 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="mb-6 bg-green-950/50 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-start gap-3">
                        <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="block font-semibold mb-1">Application Submitted Successfully!</span>
                            <span className="text-sm">Redirecting to dashboard...</span>
                        </div>
                    </div>
                )}

                {/* Question Card */}
                <div className="bg-deepCard border border-stone-800 rounded-xl p-8 shadow-xl">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">{currentQuestion.question}</h2>
                        {currentQuestion.type === 'radio' && (
                            <p className="text-stone-400 text-sm">Select the option that best describes you</p>
                        )}
                    </div>

                    {/* Radio Options */}
                    {currentQuestion.type === 'radio' && (
                        <div className="space-y-4 mb-8">
                            {currentQuestion.options.map((option, index) => (
                                <label
                                    key={option.value}
                                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                                        formData[currentQuestion.id] === option.value
                                            ? 'border-neonGreen bg-neonGreen/10'
                                            : 'border-stone-700 hover:border-stone-600 bg-darkBg'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={currentQuestion.id}
                                        value={option.value}
                                        checked={formData[currentQuestion.id] === option.value}
                                        onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                                        className="w-5 h-5 accent-neonGreen"
                                    />
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`p-2 rounded-full ${
                                            formData[currentQuestion.id] === option.value
                                                ? 'bg-neonGreen text-darkBg'
                                                : 'bg-stone-700 text-stone-400'
                                        }`}>
                                            {option.icon}
                                        </div>
                                        <span className="text-white font-medium">{option.label}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Textarea */}
                    {currentQuestion.type === 'textarea' && (
                        <div className="mb-8">
                            <textarea
                                required
                                className="w-full bg-darkBg border border-stone-700 rounded-lg px-4 py-3 text-white focus:border-neonGreen focus:ring-2 focus:ring-neonGreen/20 outline-none transition-all resize-none"
                                rows={6}
                                placeholder={currentQuestion.placeholder}
                                value={formData[currentQuestion.id] || ''}
                                onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                            />
                            <p className="text-stone-500 text-sm mt-2">
                                {formData[currentQuestion.id]?.length || 0} characters
                            </p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                currentStep === 1
                                    ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                                    : 'bg-stone-800 text-white hover:bg-stone-700'
                            }`}
                        >
                            Previous
                        </button>

                        {currentStep === totalSteps ? (
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-neonGreen text-darkBg font-bold rounded-lg hover:bg-accentGreen transition-all flex items-center gap-2 shadow-lg shadow-neonGreen/25"
                            >
                                <CheckCircle size={20} />
                                Submit Application
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!formData[currentQuestion.id]}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                    formData[currentQuestion.id]
                                        ? 'bg-neonGreen text-darkBg hover:bg-accentGreen'
                                        : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                                }`}
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>

                {/* Additional Information */}
                <div className="mt-8 bg-deepCard border border-stone-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="text-neonGreen" size={20} />
                        Certifications (Optional)
                    </h3>
                    <input
                        type="text"
                        className="w-full bg-darkBg border border-stone-700 rounded-lg px-4 py-3 text-white focus:border-neonGreen outline-none mb-2"
                        placeholder="e.g., CPR Certification, Wildlife Conservation Course, First Aid"
                        onChange={handleCertChange}
                    />
                    <p className="text-stone-500 text-sm">
                        Add any relevant certifications separated by commas
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SiteManagerApply;
