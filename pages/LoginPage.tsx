import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import { User } from '../types'; 
import api from '../api';


const CameraIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M9 3h6l2 2h4a1 1 0 011 1v12a1 1 0 01-1-1H3a1 1 0 01-1-1V6a1 1 0 011-1h4l2-2zm3 16a5 5 0 100-10 5 5 0 000 10zm0-2a3 3 0 100-6 3 3 0 000 6z"/></svg>);
const ScanIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 012-2h2m0 16H5a2 2 0 01-2-2v-2m16 2v2a2 2 0 01-2 2h-2m0-16h2a2 2 0 012 2v2M12 12l-2-2m4 0l-2 2"/><path stroke="currentColor" strokeWidth="2" fill="none" d="M3 12h18"/></svg>);
const EyeIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>);
const ReportIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>);
const GoogleIcon = ({ className }) => ( <svg className={className} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>);
const CheckIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>);
const ShieldIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>);
const EmailIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>);
const LockIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>);
const UserIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>);
const EyeOffIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>);


const LoginPage = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
 const [error, setError] = useState(''); 


    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeIn' } },
    };
    
     const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        if (isSignUp) {
            if (password !== confirmPassword) {
                return setError("Passwords do not match!");
            }
            try {
                // 2. Use 'api.post' which automatically uses the correct server address
                await api.post('/register', { name, email, password });
                alert('Registration successful! Please sign in to continue.');
                setIsSignUp(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Registration failed.');
            }
        } else {
            try {
                // 2. Use 'api.post' here as well
                const result = await api.post('/login', { email, password });
                if (result.data.token) {
                    const token = result.data.token;
                    // 3. Use the CORRECT key to save the token
                    localStorage.setItem('billboard_inspector_token', token);
                    const decodedUser: User = jwtDecode(token);
                    onLogin(decodedUser);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Login failed. Check credentials.');
            }
        }
    };

   

    const features = [
        { icon: <CheckIcon className="h-5 w-5 text-emerald-600" />, text: "AI-powered billboard compliance detection" },
        { icon: <CheckIcon className="h-5 w-5 text-emerald-600" />, text: "Real-time violation reporting system" },
        { icon: <CheckIcon className="h-5 w-5 text-emerald-600" />, text: "Geolocation-based tracking and analytics" },
        { icon: <CheckIcon className="h-5 w-5 text-emerald-600" />, text: "Integration with municipal authorities" },
        { icon: <CheckIcon className="h-5 w-5 text-emerald-600" />, text: "Comprehensive dashboard and reporting tools" }
    ];
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 z-10">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center space-x-3">
                        <div className=" rounded-xl ">
                            <img src="logo.png" className="h-10 w-10 rounded-full" alt="" />
                        </div>
                        <span className=" animate-tracking-in-expand text-2xl font-bold bg-gradient-to-r from-red-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Billboard Inspector
                        </span>
                    </div>
                    <div className="hidden md:flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                        <ShieldIcon className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Trusted by 5000+ Cities</span>
                    </div>
                </div>
            </div>

            <div className="min-h-screen flex items-center justify-center px-4 pt-24">
                <div className="w-full max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        
                        {/* Left Side: Hero Content */}
                        <div className="text-center lg:text-left space-y-8">
                            <div className="space-y-6">
                                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                                    <span className=" animate-tracking-in-expand bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        Smart Billboard
                                    </span>
                                    <br />
                                    <span className=" animate-tracking-in-expand bg-gradient-to-r from-red-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                        Compliance
                                    </span>
                                </h1>
                                <p className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                    Empower citizens with AI-driven technology to identify illegal billboards, ensuring urban safety and preserving city aesthetics through intelligent monitoring.
                                </p>
                            </div>
                            
                            {/* How It Works */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">How It Works</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ScanIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white"/>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-base sm:text-lg">Capture</h4>
                <p className="text-xs sm:text-sm text-gray-600">Snap a photo of any billboard using our mobile-optimized interface</p>
            </div>
        </div>
        <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <EyeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white"/>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-base sm:text-lg">Analyze</h4>
                <p className="text-xs sm:text-sm text-gray-600">Advanced AI instantly evaluates compliance with local regulations</p>
            </div>
        </div>
        <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ReportIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white"/>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-base sm:text-lg">Report</h4>
                <p className="text-xs sm:text-sm text-gray-600">Shows the user with detailed violation reports of the billboards</p>
            </div>
        </div>
        <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <EyeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white"/>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-base sm:text-lg">Score</h4>
                <p className="text-xs sm:text-sm text-gray-600">Score points on every violation detected and win amazing rewards</p>
            </div>
        </div>
    </div>
</div>
                        </div>

                        {/* Right Side: Authentication Form */}
                        <div className=" animate-bounce-in-top flex justify-center lg:justify-end">
                            <div className="w-full max-w-md">
                                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                                    {/* Animated Toggle Switch for Sign In / Sign Up */}
                                    <div className="relative flex bg-gray-100 rounded-2xl p-1 mb-8">
                                        <button
                                            onClick={() => setIsSignUp(false)}
                                            className="flex-1 py-3 px-6 rounded-xl font-semibold z-10 transition-colors duration-300"
                                            style={{ color: !isSignUp ? '#111827' : '#6b7280' }}
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => setIsSignUp(true)}
                                            className="flex-1 py-3 px-6 rounded-xl font-semibold z-10 transition-colors duration-300"
                                            style={{ color: isSignUp ? '#111827' : '#6b7280' }}
                                        >
                                            Sign Up
                                        </button>
                                        <motion.div
                                            className="absolute top-1 bottom-1 w-1/2 bg-white rounded-xl shadow-md"
                                            layout
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            initial={false}
                                            animate={{ x: isSignUp ? '100%' : '0%' }}
                                        />
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isSignUp ? 'signup' : 'signin'}
                                            variants={formVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <div className="space-y-6">
                                                <div className="text-center space-y-2">
                                                    <h2 className="text-3xl font-bold text-gray-800">
                                                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                                                    </h2>
                                                    <p className="text-gray-600">
                                                        {isSignUp
                                                            ? 'Join thousands of citizens making cities better'
                                                            : 'Sign in to access your billboard monitoring dashboard'}
                                                    </p>
                                                </div>
                                                
                                               
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-300" />
                                                    </div>
                                                    <div className="relative flex justify-center">
                                                        <span className="bg-white px-4 text-sm text-gray-500"> Continue With Email</span>
                                                    </div>
                                                </div>

                                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                                    {isSignUp && (
                                                        <div className="relative">
                                                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                placeholder="Full Name"
                                                                value={name}
                                                                onChange={(e) => setName(e.target.value)}
                                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-600"
                                                                required
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="relative">
                                                        <EmailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            placeholder="Email Address"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-600"
                                                            required
                                                        />
                                                    </div>
                                                    
                                                    <div className="relative">
                                                        <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            name="password"
                                                            placeholder="Password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-600"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                        >
                                                            {showPassword ? (
                                                                <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                            ) : (
                                                                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {isSignUp && (
                                                        <div className="relative">
                                                            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                            <input
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                name="confirmPassword"
                                                                placeholder="Confirm Password"
                                                                value={confirmPassword}
                                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-600"
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                            >
                                                                {showConfirmPassword ? (
                                                                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                                ) : (
                                                                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {!isSignUp && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <label className="flex items-center space-x-2"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> <span className="text-gray-600">Remember me</span></label>
                                                            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                                                                Forgot password?
                                                            </a>
                                                        </div>
                                                    )}

                                                    <button
                                                        type="submit"
                                                        className="w-full bg-gradient-to-r from-red-400 via-blue-500 to-purple-500 hover:from-red-600 hover:to-purple-600 hover:via-blue-600  text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                                    >
                                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                                    </button>
                                                </form>

                                                <div className="text-center text-sm text-gray-500">
                                                    By continuing, you agree to our{' '}
                                                    <a href="https://app.websitepolicies.com/policies/view/qkipmp8k" className="text-blue-600 hover:text-blue-800">Terms of Service</a>
                                                    {' '}and{' '}
                                                    <a href="https://app.websitepolicies.com/policies/view/mk3ruyhn" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Details Section */}
            <div className="mt-20 bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                <div className=" animate-text-focus-in text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Platform Features & Capabilities</h3>
                    <p className="text-gray-600">Comprehensive solution for municipal billboard compliance management</p>
                </div>
                
                <div className=" grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className=" animate-text-focus-in space-y-4">
                        <h4 className="font-semibold text-gray-800 text-lg">Core Features</h4>
                        <div className="space-y-2">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    {feature.icon}
                                    <span className="text-sm text-gray-600">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className=" animate-text-focus-in space-y-4">
                        <h4 className="font-semibold text-gray-800 text-lg">Technical Specifications</h4>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p><strong>AI Model:</strong> Custom-trained computer vision using TensorFlow</p>
                            <p><strong>Accuracy:</strong> 94.7% billboard detection & classification rate</p>
                            <p><strong>Processing:</strong> Real-time image analysis under 10 seconds</p>
                            <p><strong>Coverage:</strong> Supports 50+ municipal regulation frameworks</p>
                            <p><strong>Integration:</strong>Yolo V8 and Gemini API</p>
                        </div>
                    </div>
                    
                    <div className=" animate-text-focus-in space-y-4">
                        <h4 className="font-semibold text-gray-800 text-lg">Impact & Statistics</h4>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p><strong>Cities Served:</strong> 500+ municipalities worldwide</p>
                            <p><strong>Billboards Analyzed:</strong> Over 2.3 million inspections</p>
                            <p><strong>Violations Detected:</strong> 340,000+ non-compliant structures</p>
                            <p><strong>Response Time:</strong> Average 48-hour authority notification</p>
                            <p><strong>User Base:</strong> 15,000+ active citizen inspectors</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-500">
                            © 2025 Billboard Inspector. All Rights Reserved.
                        </p>
                        <div className="flex justify-center space-x-4 text-sm">
                            <a href="https://app.websitepolicies.com/policies/view/qkipmp8k" className="text-blue-600 hover:text-blue-800 transition-colors">Terms of Service</a>
                            <span className="text-gray-400">•</span>
                            <a href="https://app.websitepolicies.com/policies/view/mk3ruyhn" className="text-blue-600 hover:text-blue-800 transition-colors">Privacy Policy</a>
                            <span className="text-gray-400">•</span>
                            <a href="" className="text-blue-600 hover:text-blue-800 transition-colors">API Documentation</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;





