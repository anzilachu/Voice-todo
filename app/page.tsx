'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const VoiceAnimation = () => {
  const tasks = [
    { text: "Review project timeline", time: "9:00 AM", priority: "High" },
    { text: "Team sync meeting", time: "10:30 AM", priority: "Medium" },
    { text: "Update documentation", time: "1:00 PM", priority: "Low" },
    { text: "Client presentation", time: "3:00 PM", priority: "High" }
  ];

  const [visibleTasks, setVisibleTasks] = useState<number[]>([]);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const addInterval = setInterval(() => {
      setVisibleTasks(prev => {
        if (prev.length === tasks.length) {
          return prev;
        }
        return [...prev, prev.length];
      });
    }, 2000);

    const completeInterval = setInterval(() => {
      setCompletedTasks(prev => {
        if (prev.length === tasks.length) {
          // Reset everything when all tasks are completed
          setVisibleTasks([]);
          setCompletedTasks([]);
          return [];
        }
        if (prev.length < visibleTasks.length) {
          return [...prev, prev.length];
        }
        return prev;
      });
    }, 3000);

    const micInterval = setInterval(() => {
      setIsListening(prev => !prev);
    }, 1000);

    return () => {
      clearInterval(addInterval);
      clearInterval(completeInterval);
      clearInterval(micInterval);
    };
  }, [visibleTasks.length]);

  const priorityColors = {
    High: 'bg-red-50 border-red-200',
    Medium: 'bg-yellow-50 border-yellow-200',
    Low: 'bg-green-50 border-green-200'
  };

  return (
    <div className="relative bg-white/50 rounded-2xl backdrop-blur-sm border border-gray-100 p-8 w-full max-w-2xl mx-auto shadow-sm min-h-[500px]">
      <div className="absolute top-8 right-8 flex items-center gap-3">
        <motion.div
          animate={isListening ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <svg 
            className={`w-8 h-8 ${isListening ? 'text-red-500' : 'text-gray-400'}`}
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </motion.div>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 font-medium"
          >
            Listening...
          </motion.div>
        )}
      </div>
      <div className="space-y-6 mt-8">
        {tasks.map((task, index) => (
          visibleTasks.includes(index) && (
            <motion.div
              key={task.text}
              className={`flex items-start gap-4 bg-white rounded-xl p-6 shadow-sm border ${priorityColors[task.priority as keyof typeof priorityColors]}`}
              initial={{ opacity: 0, y: 20, x: -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <motion.div
                animate={completedTasks.includes(index) ? {
                  scale: [1, 1.3, 1],
                  backgroundColor: ['#fff', '#16a34a', '#16a34a']
                } : {}}
                className={`w-6 h-6 mt-1 rounded-full border-2 flex items-center justify-center
                  ${completedTasks.includes(index) ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}
              >
                {completedTasks.includes(index) && (
                  <motion.svg
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </motion.div>
              <div className="flex-1">
                <div className={`text-base font-medium ${completedTasks.includes(index) ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {task.text}
                </div>
                <div className="mt-1 flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {task.time}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'High' ? 'bg-red-100 text-red-700' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2"
              >
                {!completedTasks.includes(index) && (
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5"/>
                    </svg>
                  </button>
                )}
              </motion.div>
            </motion.div>
          )
        ))}
      </div>
    </div>
  );
};

const HeroAnimation = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const phases = [
    "Speak your task...",
    "Going to gym tomorrow at 6 AM",
    "Creating task...",
    "✓ Task created: Gym session tomorrow 6 AM"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % phases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-24 bg-white/50 rounded-xl backdrop-blur-sm border border-gray-100 p-4 w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute inset-0 flex items-center justify-center p-4"
        >
          <div className="flex items-center gap-3">
            {currentPhase === 0 && (
              <svg className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
            <span className={`${currentPhase === 3 ? 'text-green-600' : 'text-gray-900'}`}>
              {phases[currentPhase]}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ProductivityAnimation = () => {
  const [visibleTasks, setVisibleTasks] = useState<number[]>([]);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);

  const tasks = [
    { text: "Review project timeline", time: "9:00 AM", priority: "High" },
    { text: "Team sync meeting", time: "10:30 AM", priority: "Medium" },
    { text: "Update documentation", time: "1:00 PM", priority: "Low" },
    { text: "Client presentation", time: "3:00 PM", priority: "High" }
  ];

  useEffect(() => {
    // Add tasks one by one
    const addInterval = setInterval(() => {
      setVisibleTasks(prev => {
        if (prev.length === tasks.length) {
          return prev;
        }
        setIsListening(true);
        setProcessingIndex(prev.length);
        setTimeout(() => {
          setProcessingIndex(null);
          setIsListening(false);
        }, 1500);
        return [...prev, prev.length];
      });
    }, 3000);

    // Complete tasks one by one
    const completeInterval = setInterval(() => {
      if (visibleTasks.length > 0) {
        setCompletedTasks(prev => {
          if (prev.length === tasks.length) {
            // Reset everything when all tasks are completed
            setVisibleTasks([]);
            setCompletedTasks([]);
            return [];
          }
          if (prev.length < visibleTasks.length) {
            return [...prev, prev.length];
          }
          return prev;
        });
      }
    }, 4000);

    return () => {
      clearInterval(addInterval);
      clearInterval(completeInterval);
    };
  }, [visibleTasks.length]);

  const priorityColors = {
    High: 'border-red-200',
    Medium: 'border-yellow-200',
    Low: 'border-green-200'
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Voice Tasks</h3>
          {isListening && (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </motion.div>
              <span className="text-sm text-gray-500">Listening...</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {visibleTasks.map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative bg-white rounded-lg p-4 border ${priorityColors[tasks[index].priority as keyof typeof priorityColors]}`}
            >
              {processingIndex === index ? (
                <div className="flex items-center gap-3 text-blue-600">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Processing task...</span>
                </div>
              ) : (
                <div className={`flex items-center justify-between ${completedTasks.includes(index) ? "text-gray-400" : "text-gray-900"}`}>
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${completedTasks.includes(index) ? "border-green-500 bg-green-500" : "border-gray-300"}`}
                      animate={completedTasks.includes(index) ? {
                        scale: [1, 1.2, 1],
                        backgroundColor: ["#fff", "#22c55e", "#22c55e"]
                      } : {}}
                    >
                      {completedTasks.includes(index) && (
                        <motion.svg
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </motion.svg>
                      )}
                    </motion.div>
                    <span className={completedTasks.includes(index) ? "line-through" : ""}>
                      {tasks[index].text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{tasks[index].time}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tasks[index].priority === 'High' ? 'bg-red-100 text-red-700' :
                      tasks[index].priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {tasks[index].priority}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Refs for animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const featureCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const testimonialRef = useRef(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/todo');
    }
  }, [status, router]);

  // GSAP Animations
  useEffect(() => {
    // Hero section fade in
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out"
    });

    // Features section reveal
    gsap.from(featuresRef.current, {
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      y: 50,
      duration: 1
    });

    // Feature cards stagger animation
    featureCardsRef.current.forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: index * 0.2
      });
    });

    // Testimonial parallax effect
    gsap.to(testimonialRef.current, {
      scrollTrigger: {
        trigger: testimonialRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      },
      y: 100,
      ease: "none"
    });
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900"></div>
      </div>
    );
  }

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/todo' });
  };

  const faqs = [
    {
      question: "How does Speak & Plan work?",
      answer: "Your voice is recorded on your device and then OpenAI's Whisper API transcribes your voice into text. I then use ChatGPT to understand the text and create events. I also use ChatGPT to recommend you events based on your interests and previous events."
    },
    {
      question: "Is my data private?",
      answer: "Your audio file is on my Vercel server for processing and is then immediately deleted. I send the audio file to OpenAI for transcription. This transcribed text is then stored in the database. I also send the transcribed text to ChatGPT for event creation and recommendations. This data cannot be accessed by anyone else. If you want me to delete your data, please contact me at anzilachu55@gmail.com"
    },
    {
      question: "Can I use Speak & Plan offline?",
      answer: "Unfortunately not! Speak & Plan uses a couple of online APIs to work. In the future I may consider adding offline support."
    },
    {
      question: "Can I give feedback/request a feature?",
      answer: "Absolutely! Interact with the community, share your feedback, or ask for help if you have any issues."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background line grid pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px)] bg-[size:40px_100%]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:100%_40px]"></div>
      </div>
      
      <div className="relative">
        {/* Top navigation */}
        <nav className="absolute top-0 left-0 right-0 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-end items-center">
            {/* Navigation content if needed */}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex flex-col items-center justify-center">
          {/* Hero Section */}
          <section ref={heroRef} className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto w-full space-y-12 sm:space-y-16 text-center">
              <div className="space-y-6 sm:space-y-8">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-5xl sm:text-7xl lg:text-8xl font-extralight tracking-tight text-gray-900 leading-[1.1]"
                >
                  Speak your tasks.
                  <br />
                  <span className="text-gray-400">Plan your day.</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto font-light tracking-wide"
                >
                  Transform your voice into organized tasks. The fastest way to capture and organize your thoughts.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <HeroAnimation />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="pt-4 sm:pt-8"
                >
                  <div className="relative inline-block w-full sm:w-auto px-4 sm:px-0">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-light transition-all duration-300 flex items-center justify-center sm:justify-start gap-2 sm:gap-3 group"
                    >
                      <span>Get Started</span>
                      <motion.svg 
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-4 h-4 sm:w-5 sm:h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </button>
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-4 right-4 sm:left-0 sm:right-0 mt-2 origin-top"
                        >
                          <button
                            onClick={handleSignIn}
                            className="w-full bg-white hover:bg-gray-50 text-gray-900 px-4 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-light transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-lg border border-gray-200 group whitespace-nowrap"
                          >
                            <Image
                              src="https://www.google.com/favicon.ico"
                              alt="Google"
                              width={20}
                              height={20}
                              className="opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <span>continue with google</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-7xl">
              <div className="max-w-2xl mb-24">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-4"
                >
                  Everything you need
                  <span className="block mt-2 text-black">to stay organized</span>
                </motion.h2>
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-1 w-24 bg-black"
                />
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 gap-16 lg:grid-cols-3"
              >
                {[
                  {
                    title: "Voice Commands",
                    description: "Simply speak your tasks naturally, and let our AI handle the rest. No typing needed, just talk as you would to a personal assistant.",
                    number: "01"
                  },
                  {
                    title: "Smart Organization",
                    description: "Tasks are automatically categorized and prioritized based on your needs. Our AI understands context and importance.",
                    number: "02"
                  },
                  {
                    title: "Time Management",
                    description: "AI-powered time estimates help you plan your day effectively. Get smart suggestions for task scheduling and deadlines.",
                    number: "03"
                  }
                ].map((feature, index) => (
                  <motion.div 
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 * (index + 3) }}
                    className="relative"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-bold text-black/10">{feature.number}</span>
                      <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="mt-6 text-base leading-7 text-gray-600 border-l-2 border-black/10 pl-4">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Get Started Section */}
          <section className="relative py-16 sm:py-24 overflow-hidden">
            <div className="absolute inset-x-0 -top-16 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl">
              <div className="aspect-[1318/752] w-[200%] flex-none bg-gradient-to-r from-gray-100 to-gray-50 opacity-25" />
            </div>
            <div className="mx-auto max-w-2xl lg:max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:gap-y-16 lg:grid-cols-2">
                <div className="lg:pr-8 lg:pt-4">
                  <div className="lg:max-w-lg">
                    <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-4">Get Started</h2>
                    <p className="mt-2 text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-gray-900">
                      Voice-powered productivity
                    </p>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-600">
                      Experience the future of task management with our AI-powered voice todo app. Just speak your tasks and let our app handle the rest.
                    </p>
                    <dl className="mt-8 sm:mt-10 max-w-xl space-y-6 sm:space-y-8 text-sm sm:text-base leading-6 sm:leading-7 text-gray-600 lg:max-w-none">
                      <div className="relative pl-9 sm:pl-10">
                        <dt className="inline font-semibold text-gray-900">
                          <div className="absolute left-1 top-1 h-5 w-5 text-base sm:text-lg">🎯</div>
                          Smart Task Creation
                        </dt>
                        <dd className="inline ml-1 sm:ml-2">Speak naturally and let AI understand and organize your tasks.</dd>
                      </div>
                      <div className="relative pl-9 sm:pl-10">
                        <dt className="inline font-semibold text-gray-900">
                          <div className="absolute left-1 top-1 h-5 w-5 text-base sm:text-lg">⚡</div>
                          Time Estimation
                        </dt>
                        <dd className="inline ml-1 sm:ml-2">AI automatically estimates time required for each task.</dd>
                      </div>
                      <div className="relative pl-9 sm:pl-10">
                        <dt className="inline font-semibold text-gray-900">
                          <div className="absolute left-1 top-1 h-5 w-5 text-base sm:text-lg">🔄</div>
                          Task Management
                        </dt>
                        <dd className="inline ml-1 sm:ml-2">Easily organize, complete, and track your daily tasks.</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="flex items-start justify-center lg:justify-end lg:order-first">
                  <div className="w-full max-w-md lg:max-w-none">
                    <ProductivityAnimation />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="relative isolate overflow-hidden bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:max-w-4xl">
                <figure className="grid gap-8 sm:gap-12">
                  <div className="text-center">
                    <blockquote>
                      <p className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed text-gray-900">
                        "This voice-powered todo app has completely transformed how I manage my tasks. 
                        The ability to simply speak my tasks while multitasking has boosted my productivity significantly."
                      </p>
                    </blockquote>
                    <div className="mt-6 sm:mt-8 flex items-center justify-center gap-x-2">
                      {[...Array(5)].map((_, i) => (
                        <motion.svg
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 * i }}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                            clipRule="evenodd"
                          />
                        </motion.svg>
                      ))}
                    </div>
                  </div>
                  <figcaption className="text-center">
                    <div className="mt-4">
                      <div className="flex justify-center">
                        <Image
                          className="h-12 w-12 rounded-full object-cover"
                          src="/testimonial.jpg"
                          alt="Sarah Johnson"
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="mt-4">
                        <div className="text-base font-medium text-gray-900">Sarah Johnson</div>
                        <div className="text-sm text-gray-600">Product Designer</div>
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>
            <div className="absolute inset-x-0 -top-16 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl">
              <div className="aspect-[1318/752] w-[200%] flex-none bg-gradient-to-r from-gray-100 to-gray-50 opacity-25" />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 sm:py-20 lg:py-24 w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-4">Frequently asked questions</h2>
                <p className="text-base sm:text-lg text-gray-500 font-light">Everything you need to know about Speak & Plan</p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-sm"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-6 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between"
                    >
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          openFAQ === index ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      className={`px-6 sm:px-8 transition-all duration-200 ease-in-out ${
                        openFAQ === index
                          ? 'max-h-96 pb-4 sm:pb-6 opacity-100'
                          : 'max-h-0 overflow-hidden opacity-0'
                      }`}
                    >
                      <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-gray-500">
              2024 Speak & Plan. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
