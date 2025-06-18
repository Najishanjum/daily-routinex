
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, BookOpen, Trophy, Star, Clock, Users, CheckCircle, PlayCircle } from 'lucide-react';
import { Task } from '@/types/task';
import { toast } from 'sonner';

interface MiniCoursesProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksGenerated: (tasks: Omit<Task, 'id'>[]) => void;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  lessons: number;
  enrolled: boolean;
  rating: number;
  students: number;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'reading' | 'quiz';
  duration: string;
  completed: boolean;
}

const SAMPLE_COURSES: Course[] = [
  {
    id: '1',
    title: 'Morning Productivity Mastery',
    description: 'Transform your mornings with evidence-based routines that boost focus and energy throughout the day.',
    category: 'Productivity',
    duration: '5 days',
    difficulty: 'Beginner',
    progress: 60,
    lessons: 8,
    enrolled: true,
    rating: 4.8,
    students: 1247
  },
  {
    id: '2',
    title: 'Mindful Self-Care Journey',
    description: 'Discover sustainable self-care practices that nurture your mental, physical, and emotional well-being.',
    category: 'Self-Care',
    duration: '7 days',
    difficulty: 'Beginner',
    progress: 0,
    lessons: 12,
    enrolled: false,
    rating: 4.9,
    students: 892
  },
  {
    id: '3',
    title: 'Focus & Deep Work Bootcamp',
    description: 'Master the art of deep work and eliminate distractions for maximum productivity.',
    category: 'Productivity',
    duration: '5 days',
    difficulty: 'Intermediate',
    progress: 0,
    lessons: 10,
    enrolled: false,
    rating: 4.7,
    students: 567
  },
  {
    id: '4',
    title: 'Stress-Free Evening Rituals',
    description: 'Wind down peacefully with calming routines that improve sleep quality and reduce anxiety.',
    category: 'Wellness',
    duration: '5 days',
    difficulty: 'Beginner',
    progress: 0,
    lessons: 6,
    enrolled: false,
    rating: 4.6,
    students: 734
  }
];

const SAMPLE_LESSONS: Record<string, Lesson[]> = {
  '1': [
    { id: '1-1', title: 'The Science of Morning Routines', type: 'video', duration: '8 min', completed: true },
    { id: '1-2', title: 'Creating Your Perfect Wake-Up Time', type: 'reading', duration: '5 min', completed: true },
    { id: '1-3', title: 'Energizing Morning Exercises', type: 'video', duration: '12 min', completed: true },
    { id: '1-4', title: 'Meditation for Focus', type: 'audio', duration: '10 min', completed: false },
    { id: '1-5', title: 'Nutrition for Mental Clarity', type: 'reading', duration: '7 min', completed: false },
    { id: '1-6', title: 'Progress Check Quiz', type: 'quiz', duration: '3 min', completed: false },
    { id: '1-7', title: 'Advanced Morning Strategies', type: 'video', duration: '15 min', completed: false },
    { id: '1-8', title: 'Final Assessment', type: 'quiz', duration: '5 min', completed: false }
  ]
};

export const MiniCourses: React.FC<MiniCoursesProps> = ({ 
  isOpen, 
  onClose, 
  onTasksGenerated 
}) => {
  const [courses, setCourses] = useState<Course[]>(SAMPLE_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'mycourses' | 'lesson'>('browse');

  if (!isOpen) return null;

  const handleEnrollCourse = (courseId: string) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, enrolled: true }
        : course
    ));
    toast.success('Successfully enrolled in course!');
    
    // Generate initial tasks for the course
    const courseTasks: Omit<Task, 'id'>[] = [
      {
        title: 'Complete Day 1: Course Introduction',
        duration: 15,
        date: new Date().toISOString().split('T')[0],
        category: 'study',
        notes: 'Start your mini course journey',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ];
    
    onTasksGenerated(courseTasks);
  };

  const handleStartLesson = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course);
    setCurrentLesson(lesson);
    setActiveTab('lesson');
  };

  const handleCompleteLesson = () => {
    if (currentLesson && selectedCourse) {
      // Mark lesson as completed
      const lessons = SAMPLE_LESSONS[selectedCourse.id];
      const updatedLessons = lessons.map(lesson => 
        lesson.id === currentLesson.id 
          ? { ...lesson, completed: true }
          : lesson
      );
      SAMPLE_LESSONS[selectedCourse.id] = updatedLessons;

      // Update course progress
      const completedCount = updatedLessons.filter(l => l.completed).length;
      const progress = Math.round((completedCount / updatedLessons.length) * 100);
      
      setCourses(courses.map(course => 
        course.id === selectedCourse.id 
          ? { ...course, progress }
          : course
      ));

      toast.success('Lesson completed! 🎉');
      setCurrentLesson(null);
      setActiveTab('mycourses');

      // Generate task for next lesson
      const nextLesson = updatedLessons.find(l => !l.completed);
      if (nextLesson) {
        const courseTasks: Omit<Task, 'id'>[] = [
          {
            title: `Complete: ${nextLesson.title}`,
            duration: parseInt(nextLesson.duration),
            date: new Date().toISOString().split('T')[0],
            category: 'study',
            notes: `Next lesson in ${selectedCourse.title}`,
            completed: false,
            createdAt: new Date().toISOString()
          }
        ];
        onTasksGenerated(courseTasks);
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'audio': return <Play className="h-4 w-4" />;
      case 'reading': return <BookOpen className="h-4 w-4" />;
      case 'quiz': return <Trophy className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎓 AI Mini Courses
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Personalized learning journeys for your goals
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            ✕
          </Button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'browse'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Browse Courses
          </button>
          <button
            onClick={() => setActiveTab('mycourses')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'mycourses'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            My Courses
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'browse' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {course.description}
                        </CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.lessons} lessons
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students}
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="mb-4">
                      {course.category}
                    </Badge>

                    {course.enrolled ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <Button 
                          onClick={() => {
                            setSelectedCourse(course);
                            setActiveTab('mycourses');
                          }}
                          className="w-full mt-2"
                        >
                          Continue Learning
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleEnrollCourse(course.id)}
                        className="w-full"
                      >
                        Enroll Now - Free
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'mycourses' && (
            <div className="space-y-6">
              {courses.filter(course => course.enrolled).map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium">Progress: {course.progress}%</span>
                      <Progress value={course.progress} className="h-2 w-48" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {SAMPLE_LESSONS[course.id]?.map((lesson) => (
                        <div 
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              getTypeIcon(lesson.type)
                            )}
                            <div>
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} • {lesson.duration}
                              </p>
                            </div>
                          </div>
                          {!lesson.completed && (
                            <Button 
                              size="sm"
                              onClick={() => handleStartLesson(course, lesson)}
                            >
                              Start
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'lesson' && currentLesson && selectedCourse && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActiveTab('mycourses')}
                    >
                      ← Back to Course
                    </Button>
                  </div>
                  <CardTitle className="flex items-center gap-3">
                    {getTypeIcon(currentLesson.type)}
                    {currentLesson.title}
                  </CardTitle>
                  <CardDescription>
                    {selectedCourse.title} • {currentLesson.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currentLesson.type === 'video' && (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600 dark:text-gray-400">Video content would play here</p>
                        </div>
                      </div>
                    )}
                    
                    {currentLesson.type === 'audio' && (
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600 dark:text-gray-400">Audio meditation would play here</p>
                        </div>
                      </div>
                    )}
                    
                    {currentLesson.type === 'reading' && (
                      <div className="prose dark:prose-invert max-w-none">
                        <h3>Understanding Morning Routines</h3>
                        <p>
                          Morning routines are powerful because they set the tone for your entire day. 
                          Research shows that consistent morning habits can improve focus, reduce stress, 
                          and increase overall life satisfaction.
                        </p>
                        <h4>Key Benefits:</h4>
                        <ul>
                          <li>Improved mental clarity and focus</li>
                          <li>Reduced decision fatigue</li>
                          <li>Better stress management</li>
                          <li>Increased sense of accomplishment</li>
                        </ul>
                      </div>
                    )}
                    
                    {currentLesson.type === 'quiz' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Knowledge Check</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="font-medium mb-3">What's the most important aspect of a morning routine?</p>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input type="radio" name="quiz" value="a" />
                              <span>Waking up early</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="radio" name="quiz" value="b" />
                              <span>Consistency</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="radio" name="quiz" value="c" />
                              <span>Exercise</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Badge variant="secondary">
                        {currentLesson.type.charAt(0).toUpperCase() + currentLesson.type.slice(1)} • {currentLesson.duration}
                      </Badge>
                      <Button onClick={handleCompleteLesson}>
                        Mark as Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
