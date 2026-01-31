'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/layouts/PageHeader';
import { SUBJECTS, SUBJECT_TOPICS } from '@/types';
import { assessmentService } from '@/services/assessment.service';
import { roadmapService } from '@/services/roadmap.service';

interface AIQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  explanation?: string;
}

type AssessmentState = 'select' | 'loading' | 'in-progress' | 'generating-roadmap' | 'complete';

export default function NewAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';
  const initialTopic = searchParams.get('topic') || '';

  const [state, setState] = React.useState<AssessmentState>(initialSubject ? 'loading' : 'select');
  const [selectedSubject, setSelectedSubject] = React.useState(initialSubject);
  const [selectedTopic, setSelectedTopic] = React.useState(initialTopic);
  const [questions, setQuestions] = React.useState<AIQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [timeElapsed, setTimeElapsed] = React.useState(0);
  const [assessmentId, setAssessmentId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string>('');
  const [generatedRoadmapId, setGeneratedRoadmapId] = React.useState<number | null>(null);

  // Generate questions on mount when subject (and optional topic) come from URL
  React.useEffect(() => {
    if (initialSubject && state === 'loading') {
      handleStartAssessment();
    }
  }, [initialSubject]);

  // Timer
  React.useEffect(() => {
    if (state === 'in-progress') {
      const timer = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartAssessment = async () => {
    if (!selectedSubject) return;

    setState('loading');
    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000); // 2 min for AI

    try {
      const subjectObj = SUBJECTS.find((s) => s.value === selectedSubject);
      const subjectName = subjectObj?.label || selectedSubject;
      const topics = selectedTopic
        ? [SUBJECT_TOPICS[selectedSubject]?.find((t) => t.value === selectedTopic)?.label || selectedTopic]
        : undefined;

      const startRes = await assessmentService.start(1, subjectName);
      setAssessmentId(startRes.data.assessmentId);

      const questionsRes = await assessmentService.generateQuestions(
        subjectName,
        'intermediate',
        5,
        topics,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      const aiQuestions = questionsRes.data.questions;

      setQuestions(aiQuestions);
      setAnswers(Array(aiQuestions.length).fill(null));
      setState('in-progress');
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === 'AbortError';
      setError(
        isTimeout
          ? 'Request took too long. The AI server may be slow—try again or choose a different subject.'
          : err?.data?.error || err?.message || 'Failed to generate questions. Please try again.'
      );
      setState('select');
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (showFeedback) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      // Complete assessment: save scores, weak points, concepts; then analyze and generate roadmap
      setState('generating-roadmap');

      try {
        if (assessmentId) {
          const answersPayload = questions.map((q, i) => ({
            questionId: q.id,
            correctAnswer: q.correctAnswer,
            selectedOption: answers[i] ?? -1,
            topic: q.topic || selectedSubject,
          }));

          await assessmentService.completeWithResults(assessmentId, {
            answers: answersPayload,
            timeSpentSeconds: timeElapsed,
          });

          const analysisRes = await assessmentService.analyzeResults(assessmentId);
          const subjectObj = SUBJECTS.find((s) => s.value === selectedSubject);
          const subjectName = subjectObj?.label || selectedSubject;

          const roadmapRes = await roadmapService.generate({
            subject: subjectName,
            learningGoal: `Master ${subjectName} - Based on skill assessment`,
            hoursPerWeek: 10,
            assessmentId,
          });

          const roadmap = (roadmapRes.data as { roadmap?: { id: number }; id?: number })?.roadmap ?? roadmapRes.data;
          setGeneratedRoadmapId(roadmap?.id ?? null);
        }
      } catch (err) {
        console.error('Failed to save results or generate roadmap:', err);
      } finally {
        setState('complete');
      }
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  // Subject Selection
  if (state === 'select') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <PageHeader
          title="Start New Assessment"
          description="Choose a subject to begin your skill assessment"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Assessment', href: '/assessment' },
            { label: 'New Assessment' },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Subject & Topic</CardTitle>
            <CardDescription>
              {selectedTopic
                ? `Generate a test based on: ${SUBJECT_TOPICS[selectedSubject]?.find((t) => t.value === selectedTopic)?.label ?? selectedTopic}`
                : 'Choose a subject and optionally a topic to generate a focused test'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select
              label="Subject"
              options={SUBJECTS.map((s) => ({ value: s.value, label: s.label }))}
              value={selectedSubject}
              onChange={(v) => {
                setSelectedSubject(v);
                setSelectedTopic('');
              }}
              placeholder="Choose a subject..."
            />

            {selectedSubject && SUBJECT_TOPICS[selectedSubject]?.length > 0 && (
              <Select
                label="Topic (optional — test is generated based on this topic)"
                options={[
                  { value: '', label: 'All topics' },
                  ...SUBJECT_TOPICS[selectedSubject].map((t) => ({ value: t.value, label: t.label })),
                ]}
                value={selectedTopic}
                onChange={setSelectedTopic}
                placeholder="e.g. Flutter, React..."
              />
            )}

            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium text-gray-900">Assessment Details</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  5 questions for a quick assessment
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  Approximately 20-30 minutes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  Instant feedback on each question
                </li>
              </ul>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleStartAssessment} disabled={!selectedSubject}>
                {selectedTopic ? 'Generate test based on topic' : 'Start Assessment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading Questions
  if (state === 'loading') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Questions...</h3>
            <p className="text-sm text-gray-500 mb-1">
              AI is creating personalized questions for your assessment
            </p>
            <p className="text-xs text-gray-400">
              Usually 20–40 seconds. Please don&apos;t close this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment In Progress
  if (state === 'in-progress') {
    if (questions.length === 0) {
      return null;
    }
    const question = questions[currentQuestion];
    const isCorrect = selectedOption === question.correctAnswer;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Assessment
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="default">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(timeElapsed)}
            </Badge>
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>

        <Progress
          value={((currentQuestion + 1) / questions.length) * 100}
          size="sm"
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm">{question.topic}</Badge>
              <Badge variant="default" size="sm">{question.difficulty}</Badge>
            </div>
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, index) => {
              let optionStyle = 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50';
              
              if (showFeedback) {
                if (index === question.correctAnswer) {
                  optionStyle = 'border-green-500 bg-green-50';
                } else if (index === selectedOption && !isCorrect) {
                  optionStyle = 'border-red-500 bg-red-50';
                }
              } else if (selectedOption === index) {
                optionStyle = 'border-teal-500 bg-teal-50';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left border-2 rounded-xl transition-all ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-gray-900">{option}</span>
                    {showFeedback && index === question.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {showFeedback && index === selectedOption && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Feedback */}
        {showFeedback && (
          <Card className={isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect
                      ? 'Great job! You got this one right.'
                      : `The correct answer was: ${question.options[question.correctAnswer]}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {!showFeedback ? (
            <Button onClick={handleSubmitAnswer} disabled={selectedOption === null}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Generating Roadmap
  if (state === 'generating-roadmap') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Learning Roadmap...</h3>
            <p className="text-sm text-gray-500">
              AI is analyzing your results and building a personalized learning plan
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment Complete
  if (state === 'complete') {
    const score = calculateScore();
    const correctCount = answers.filter((a, i) => a === questions[i].correctAnswer).length;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
              score >= 70 ? 'bg-green-100' : score >= 50 ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              {score >= 70 ? (
                <CheckCircle className={`w-10 h-10 ${score >= 70 ? 'text-green-600' : 'text-amber-600'}`} />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
            <p className="text-gray-500 mb-6">
              You scored {score}% on this assessment
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{correctCount}</p>
                <p className="text-sm text-gray-500">Correct</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{questions.length - correctCount}</p>
                <p className="text-sm text-gray-500">Incorrect</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{formatTime(timeElapsed)}</p>
                <p className="text-sm text-gray-500">Time</p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => router.push('/assessment')}>
                Back to Assessments
              </Button>
              {generatedRoadmapId ? (
                <Button onClick={() => router.push(`/roadmap/${generatedRoadmapId}`)}>
                  View Your Learning Roadmap
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={() => router.push('/roadmap/new')}>
                  Create Learning Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
