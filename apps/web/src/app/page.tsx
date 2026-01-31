'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  GraduationCap,
  Map,
  Users,
  Bot,
  BarChart3,
  Video,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Play,
  Zap,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { FadeInUp, StaggerContainer, StaggerItem, Float, HoverLift, AnimatedCounter } from '@/components/motion';
import { AnimatedButton } from '@/components/ui/animated-button';

const features = [
  {
    icon: Map,
    title: 'Personalized Roadmaps',
    description: 'AI-generated learning paths tailored to your goals, schedule, and current skill level.',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Study Buddy Matching',
    description: 'Connect with peers who share your interests and learning style for collaborative study.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Bot,
    title: 'AI Study Assistant',
    description: 'Get instant help with concepts, code debugging, and study planning from our AI tutor.',
    color: 'from-cyan-500 to-teal-600',
  },
  {
    icon: Video,
    title: 'Live Study Sessions',
    description: 'Video calls with real-time transcription and AI assistance during study sessions.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track your learning journey with detailed insights and achievement milestones.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'Skill Assessments',
    description: 'Identify knowledge gaps with adaptive assessments and get targeted recommendations.',
    color: 'from-amber-500 to-orange-500',
  },
];

const stats = [
  { value: 50000, suffix: '+', label: 'Active Learners' },
  { value: 1000, suffix: '+', label: 'Learning Paths' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
  { value: 4.9, suffix: '', label: 'App Rating' },
];

const navItems = ['Features', 'How it Works', 'About'];

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50"
          style={{ y: backgroundY }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-100/40 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
      </div>

      {/* Floating Orbs */}
      <motion.div
        className="fixed top-20 right-20 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl -z-10"
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed bottom-20 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl -z-10"
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="mx-3 mt-3 sm:mx-4 sm:mt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-200/40">
            <div className="flex items-center justify-between gap-4">
              <Link href="#" className="flex-shrink-0" aria-label="ScholarPass home">
                <motion.div
                  className="flex items-center gap-2.5 sm:gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-md shadow-teal-500/25">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    ScholarPass
                  </span>
                </motion.div>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                    className="px-4 py-2 rounded-lg text-gray-600 hover:text-teal-600 hover:bg-teal-50/80 font-medium transition-colors relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:bg-teal-500 after:rounded-full after:opacity-0 hover:after:opacity-100 after:w-4 after:transition-opacity"
                    whileHover={{ y: -1 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>

              {/* Right: CTA + mobile menu toggle */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <Link href="/login" className="hidden sm:block">
                  <motion.span
                    className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-gray-600 hover:text-teal-600 hover:bg-gray-100 font-medium text-sm transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In
                  </motion.span>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <AnimatedButton variant="gradient" size="sm" glow className="min-h-[36px] sm:min-h-[40px] px-4 sm:px-5">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </AnimatedButton>
                </Link>
                <motion.button
                  type="button"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  className="md:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors"
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  whileTap={{ scale: 0.95 }}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.button>
                {/* Mobile only: compact Get Started next to menu */}
                <Link href="/register" className="sm:hidden">
                  <AnimatedButton variant="gradient" size="sm" glow className="!h-9 !px-3 text-sm min-w-0">
                    Get Started
                    <ArrowRight className="w-3.5 h-3.5" />
                  </AnimatedButton>
                </Link>
              </div>
            </div>

            {/* Mobile menu */}
            <motion.nav
              className="md:hidden overflow-hidden"
              initial={false}
              animate={{ height: mobileMenuOpen ? 'auto' : 0, opacity: mobileMenuOpen ? 1 : 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="pt-3 pb-2 border-t border-gray-200/60 mt-3 flex flex-col gap-0.5">
                {navItems.map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                    className="px-4 py-3 rounded-xl text-gray-600 hover:text-teal-600 hover:bg-teal-50 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    whileTap={{ scale: 0.99 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-200/60">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <span className="block px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-medium">
                      Sign In
                    </span>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <span className="block px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-center">
                      Get Started
                    </span>
                  </Link>
                </div>
              </div>
            </motion.nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <FadeInUp delay={0.3}>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  Learn Smarter,
                  <br />
                  <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Not Harder
                  </span>
                </h1>
              </FadeInUp>

              <FadeInUp delay={0.4}>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Personalized learning roadmaps, AI-powered study assistance, and peer collaboration
                  to accelerate your education journey.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.5}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                  <Link href="/register" className="w-full sm:w-auto">
                    <AnimatedButton
                      variant="gradient"
                      size="xl"
                      glow
                      rightIcon={<ArrowRight className="w-5 h-5 shrink-0" />}
                      className="w-full sm:w-auto min-h-[48px] sm:min-h-[56px] px-6 sm:px-8 text-base sm:text-lg justify-center"
                    >
                      Start Learning Free
                    </AnimatedButton>
                  </Link>
                  <AnimatedButton
                    variant="outline"
                    size="xl"
                    leftIcon={<Play className="w-5 h-5 shrink-0" />}
                    className="w-full sm:w-auto min-h-[48px] sm:min-h-[56px] px-6 sm:px-8 text-base sm:text-lg justify-center"
                  >
                    Watch Demo
                  </AnimatedButton>
                </div>
              </FadeInUp>
            </div>

            {/* Right Content - Hero Visual */}
            <div className="relative hidden lg:block">
              <Float amplitude={15} duration={4}>
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {/* Main Card - Courses & Features */}
                  <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <Map className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Explore Courses</h3>
                        <p className="text-sm text-gray-500">Roadmaps, assessments & content</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      {[
                        { label: 'Skill Assessment', done: true },
                        { label: 'Learning Roadmap', done: true },
                        { label: 'Study Sessions', done: false },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                        >
                          <CheckCircle className={`w-5 h-5 ${item.done ? 'text-teal-500' : 'text-gray-300'}`} />
                          <span className={item.done ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">65% Complete</p>
                  </div>

                  {/* Floating Badge - Daily Streak */}
                  <motion.div
                    className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Daily Streak</p>
                        <p className="font-bold text-gray-900">12 Days</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Assistant Badge - teal/cyan, no purple */}
                  <motion.div
                    className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Bot className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">AI Assistant</p>
                        <p className="font-bold text-green-600 text-sm">Online</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </Float>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter value={stat.value} duration={2} />
                  {stat.suffix}
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <motion.span
                className="inline-block px-4 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4"
                whileHover={{ scale: 1.05 }}
              >
                Features
              </motion.span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Succeed
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our platform combines AI technology with proven learning strategies to help you achieve your goals faster.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={index}>
                  <HoverLift className="h-full">
                    <div className="h-full bg-white p-8 rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 group">
                      <motion.div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4">
                How It Works
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Get Started in{' '}
                <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Minutes
                </span>
              </h2>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-teal-200 via-cyan-200 to-teal-200" />

            {[
              {
                step: '01',
                title: 'Take Assessment',
                description: 'Complete a quick skill assessment to identify your current level and knowledge gaps.',
                icon: CheckCircle,
              },
              {
                step: '02',
                title: 'Get Your Roadmap',
                description: 'Receive an AI-generated learning path tailored to your goals and schedule.',
                icon: Map,
              },
              {
                step: '03',
                title: 'Start Learning',
                description: 'Follow your roadmap, connect with study buddies, and track your progress.',
                icon: Sparkles,
              },
            ].map((item, index) => (
              <FadeInUp key={index} delay={index * 0.2}>
                <div className="relative text-center">
                  <motion.div
                    className="w-32 h-32 mx-auto mb-6 bg-white rounded-3xl shadow-xl shadow-gray-200/50 flex items-center justify-center relative z-10 border border-gray-100"
                    whileHover={{ y: -8, rotate: 3 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-6xl font-bold bg-gradient-to-br from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      {item.step}
                    </span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-700" />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
          animate={{ x: [0, 40], y: [0, 40] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeInUp>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold mb-6 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Globe className="w-4 h-4" />
              Join 50,000+ learners worldwide
            </motion.div>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to Transform
              <br />Your Learning?
            </h2>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
              Start your personalized learning journey today and achieve your goals faster than ever before.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <Link href="/register">
              <AnimatedButton
                variant="secondary"
                size="xl"
                className="bg-white text-teal-600 hover:bg-gray-50 shadow-xl"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started for Free
              </AnimatedButton>
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">ScholarPass</span>
            </motion.div>

            <nav className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              {['About', 'Features', 'Pricing', 'Contact', 'Privacy', 'Terms'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className="hover:text-teal-600 transition-colors"
                  whileHover={{ y: -1 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ScholarPass. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Gradient animation styles */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
