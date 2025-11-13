import { student, resources, quizzes, badges as allBadges } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Award, ListChecks } from 'lucide-react';
import { PersonalizedPathClient } from './PersonalizedPathClient';

export default function StudentDashboardPage() {
  const completedLessons = resources.filter(r => student.completedLessons.includes(r.id));
  const completedQuizzes = quizzes.filter(q => Object.keys(student.quizScores).includes(q.id));
  const earnedBadges = allBadges.filter(b => student.badges.includes(b.id));

  const progressPercentage = (student.completedLessons.length / resources.length) * 100;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Welcome back, {student.name}!</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks /> My Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {student.completedLessons.length} of {resources.length} lessons completed
            </p>
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-center text-sm mt-2 font-medium text-primary animate-pulse">Keep up the great work!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award /> My Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {earnedBadges.map(badge => (
              <Badge key={badge.id} variant="secondary" className="text-sm py-1 px-3">
                <badge.icon className="w-4 h-4 mr-2 text-accent"/>
                {badge.name}
              </Badge>
            ))}
             {earnedBadges.length === 0 && <p className="text-sm text-muted-foreground">Complete lessons and quizzes to earn badges!</p>}
          </CardContent>
        </Card>
      </div>

      <div>
        <PersonalizedPathClient student={student} />
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 /> Completed Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Lessons</h3>
                <ul className="space-y-2">
                  {completedLessons.map(lesson => (
                    <li key={lesson.id} className="text-sm text-muted-foreground">{lesson.title}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quizzes</h3>
                <ul className="space-y-2">
                  {completedQuizzes.map(quiz => (
                    <li key={quiz.id} className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{quiz.title}</span>
                      <span className="font-bold text-primary">{student.quizScores[quiz.id]}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
