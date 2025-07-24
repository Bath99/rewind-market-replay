import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, BookOpen, Plus, Edit2, Trash2, Video } from "lucide-react";
import Header from "@/components/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TradingLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  content: string;
  createdAt: Date;
}

const TradingLessons = () => {
  const [lessons, setLessons] = useState<TradingLesson[]>([
    {
      id: '1',
      title: 'Introduction to Technical Analysis',
      description: 'Learn the basics of reading candlestick charts and identifying patterns',
      duration: '15 min',
      category: 'beginner',
      content: 'This lesson covers the fundamentals of technical analysis including candlestick patterns, support and resistance levels, and basic chart reading skills.',
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Understanding Volume and Price Action',
      description: 'Master the relationship between volume and price movements',
      duration: '20 min',
      category: 'intermediate',
      content: 'Volume is a crucial indicator that confirms price movements. Learn how to read volume bars and understand market sentiment.',
      createdAt: new Date()
    },
    {
      id: '3',
      title: 'Advanced Trading Strategies',
      description: 'Complex strategies for experienced traders',
      duration: '45 min',
      category: 'advanced',
      content: 'Advanced concepts including momentum trading, scalping techniques, and risk management strategies.',
      createdAt: new Date()
    }
  ]);

  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<TradingLesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    duration: '',
    category: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    videoUrl: '',
    content: ''
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleAddLesson = () => {
    if (!newLesson.title || !newLesson.description || !newLesson.content) return;

    const lesson: TradingLesson = {
      id: Date.now().toString(),
      ...newLesson,
      createdAt: new Date()
    };

    setLessons([...lessons, lesson]);
    setNewLesson({
      title: '',
      description: '',
      duration: '',
      category: 'beginner',
      videoUrl: '',
      content: ''
    });
    setIsAddingLesson(false);
  };

  const handleDeleteLesson = (id: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const handleEditLesson = (lesson: TradingLesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      category: lesson.category,
      videoUrl: lesson.videoUrl || '',
      content: lesson.content
    });
  };

  const handleUpdateLesson = () => {
    if (!editingLesson || !newLesson.title || !newLesson.description || !newLesson.content) return;

    const updatedLessons = lessons.map(lesson => 
      lesson.id === editingLesson.id 
        ? { ...lesson, ...newLesson }
        : lesson
    );

    setLessons(updatedLessons);
    setEditingLesson(null);
    setNewLesson({
      title: '',
      description: '',
      duration: '',
      category: 'beginner',
      videoUrl: '',
      content: ''
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Trading Lessons</h1>
            <p className="text-muted-foreground">
              Master the art of trading with our comprehensive video lessons and modules
            </p>
          </div>
          
          <Dialog open={isAddingLesson} onOpenChange={setIsAddingLesson}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Trading Lesson</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Lesson Title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                />
                <Input
                  placeholder="Duration (e.g., 15 min)"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                />
                <Select 
                  value={newLesson.category} 
                  onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                    setNewLesson({...newLesson, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Video URL (optional)"
                  value={newLesson.videoUrl}
                  onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                />
                <Textarea
                  placeholder="Short description"
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                  rows={2}
                />
                <Textarea
                  placeholder="Lesson content and details"
                  value={newLesson.content}
                  onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                  rows={6}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddingLesson(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddLesson}>
                    Add Lesson
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingLesson} onOpenChange={() => setEditingLesson(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Trading Lesson</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Lesson Title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
              />
              <Input
                placeholder="Duration (e.g., 15 min)"
                value={newLesson.duration}
                onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
              />
              <Select 
                value={newLesson.category} 
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                  setNewLesson({...newLesson, category: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Video URL (optional)"
                value={newLesson.videoUrl}
                onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
              />
              <Textarea
                placeholder="Short description"
                value={newLesson.description}
                onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                rows={2}
              />
              <Textarea
                placeholder="Lesson content and details"
                value={newLesson.content}
                onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                rows={6}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingLesson(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateLesson}>
                  Update Lesson
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge className={getCategoryColor(lesson.category)}>
                    {lesson.category}
                  </Badge>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditLesson(lesson)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteLesson(lesson.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {lesson.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {lesson.duration}
                  </div>
                  {lesson.videoUrl && (
                    <div className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      Video
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm">{lesson.content}</p>
                </div>

                {lesson.videoUrl && (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Video Content</p>
                    </div>
                  </div>
                )}

                <Button className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start Lesson
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingLessons;