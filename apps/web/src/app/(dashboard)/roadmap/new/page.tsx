'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Clock,
  Target,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/layouts/PageHeader';
import { SUBJECTS } from '@/types';

const HOURS_OPTIONS = [
  { value: '5', label: '5 hours/week' },
  { value: '10', label: '10 hours/week' },
  { value: '15', label: '15 hours/week' },
  { value: '20', label: '20 hours/week' },
  { value: '25', label: '25+ hours/week' },
];

type Step = 'subject' | 'goal' | 'commitment' | 'generating' | 'preview';

export default function NewRoadmapPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>('subject');
  const [formData, setFormData] = React.useState({
    subject: '',
    customSubject: '',
    learningGoal: '',
    hoursPerWeek: '',
    deadline: '',
  });
  const [generatedRoadmap, setGeneratedRoadmap] = React.useState<any>(null);

  const steps: Step[] = ['subject', 'goal', 'commitment', 'generating', 'preview'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      if (steps[nextIndex] === 'generating') {
        setStep('generating');
        // Simulate AI generation
        setTimeout(() => {
          setGeneratedRoadmap({
            subject: formData.customSubject || SUBJECTS.find(s => s.value === formData.subject)?.label,
            estimatedWeeks: 12,
            modules: [
              { name: 'Foundations', topics: ['Basic Concepts', 'Core Principles'], hours: 8 },
              { name: 'Intermediate Concepts', topics: ['Advanced Topics', 'Practice'], hours: 12 },
              { name: 'Advanced Applications', topics: ['Real-world Projects', 'Best Practices'], hours: 10 },
              { name: 'Mastery', topics: ['Expert Techniques', 'Portfolio Project'], hours: 15 },
            ],
          });
          setStep('preview');
        }, 2000);
      } else {
        setStep(steps[nextIndex]);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const handleCreate = () => {
    // In real app, save to API
    router.push('/roadmap');
  };

  const canProceed = () => {
    switch (step) {
      case 'subject':
        return formData.subject || formData.customSubject;
      case 'goal':
        return formData.learningGoal.length >= 10;
      case 'commitment':
        return formData.hoursPerWeek;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Create Learning Roadmap"
        description="Let AI design a personalized learning path for you"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Roadmaps', href: '/roadmap' },
          { label: 'Create New' },
        ]}
      />

      {/* Progress */}
      {step !== 'generating' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Step {currentStepIndex + 1} of {steps.length}</span>
            <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} size="sm" />
        </div>
      )}

      {/* Step: Subject Selection */}
      {step === 'subject' && (
        <Card>
          <CardHeader>
            <CardTitle>What do you want to learn?</CardTitle>
            <CardDescription>
              Choose a subject or enter your own learning topic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Select Subject"
              options={[...SUBJECTS.map(s => ({ value: s.value, label: s.label })), { value: 'custom', label: 'Other (Custom)' }]}
              value={formData.subject}
              onChange={(value) => setFormData({ ...formData, subject: value, customSubject: '' })}
              placeholder="Choose a subject..."
            />

            {formData.subject === 'custom' && (
              <Input
                label="Custom Subject"
                placeholder="e.g., Quantum Computing, Game Development..."
                value={formData.customSubject}
                onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
              />
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Learning Goal */}
      {step === 'goal' && (
        <Card>
          <CardHeader>
            <CardTitle>What&apos;s your learning goal?</CardTitle>
            <CardDescription>
              Describe what you want to achieve with this learning path
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Learning Goal"
              placeholder="e.g., I want to be able to build and deploy machine learning models for real-world applications, understand the math behind algorithms, and pass technical interviews..."
              value={formData.learningGoal}
              onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
              className="min-h-[120px]"
            />
            <p className="text-xs text-gray-500">
              Be specific about your goals to get a more personalized roadmap
            </p>

            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Time Commitment */}
      {step === 'commitment' && (
        <Card>
          <CardHeader>
            <CardTitle>How much time can you commit?</CardTitle>
            <CardDescription>
              This helps us create a realistic timeline for your learning path
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Weekly Time Commitment"
              options={HOURS_OPTIONS}
              value={formData.hoursPerWeek}
              onChange={(value) => setFormData({ ...formData, hoursPerWeek: value })}
              placeholder="Select hours per week..."
            />

            <Input
              label="Target Completion Date (Optional)"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              hint="Leave empty for AI to suggest a timeline"
            />

            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed()}>
                Generate Roadmap
                <Sparkles className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Generating */}
      {step === 'generating' && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-6">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Creating Your Personalized Roadmap
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Our AI is analyzing your goals and designing an optimal learning path. This may take a moment...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step: Preview */}
      {step === 'preview' && generatedRoadmap && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <Badge variant="primary">AI Generated</Badge>
            </div>
            <CardTitle>{generatedRoadmap.subject}</CardTitle>
            <CardDescription>
              Estimated completion: {generatedRoadmap.estimatedWeeks} weeks at {formData.hoursPerWeek} hours/week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {generatedRoadmap.modules.map((module: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border border-gray-100 rounded-xl hover:border-teal-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{module.name}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {module.hours} hours
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-11 flex flex-wrap gap-2">
                    {module.topics.map((topic: string, i: number) => (
                      <Badge key={i} variant="default" size="sm">{topic}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Regenerate
              </Button>
              <Button onClick={handleCreate}>
                Create Roadmap
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
