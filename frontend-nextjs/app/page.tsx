'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../src/context/UserContext';
import { useSync } from '../src/hooks/useSync';
import { Navbar } from '../src/components/Navbar';
import { WelcomeScreen } from '../src/components/WelcomeScreen';
import { MigrationBanner } from '../src/components/MigrationBanner';
import { GpaSummaryCard } from '../src/components/GpaSummaryCard';
import { CourseForm } from '../src/components/CourseForm';
import { CourseTable, CalculatedCourse } from '../src/components/CourseTable';
import { TargetCalculator } from '../src/components/TargetCalculator';
import { PathPlanner } from '../src/components/PathPlanner';
import { ScenarioWorkbench } from '../src/components/ScenarioWorkbench';
import { DegreeMap, DegreeCourseNode } from '../src/components/DegreeMap';
import { OnboardingWizard } from '../src/components/OnboardingWizard';
import { ComplianceModal } from '../src/components/ComplianceModal';

function getScoreFromGrade(gradeInput: string, systemType: string): number {
  const grade = gradeInput.toUpperCase().trim();
  if (systemType === 'ng') {
    if (grade === 'A') return 70; if (grade === 'B') return 60; if (grade === 'C') return 50;
    if (grade === 'D') return 45; if (grade === 'E') return 40; if (grade === 'F') return 0;
  } else if (systemType === 'ui') {
    if (grade === 'A') return 70; if (grade === 'A-') return 65; if (grade === 'B+') return 60;
    if (grade === 'B') return 55; if (grade === 'B-') return 50; if (grade === 'C+') return 45;
    if (grade === 'C') return 40; if (grade === 'F') return 0;
  } else if (systemType === 'poly') {
    if (grade === 'A') return 75; if (grade === 'AB') return 70; if (grade === 'B') return 65;
    if (grade === 'BC') return 60; if (grade === 'C') return 55; if (grade === 'CD') return 50;
    if (grade === 'D') return 45; if (grade === 'E') return 40; if (grade === 'F') return 0;
  } else if (systemType === 'uk') {
    if (grade === '1ST') return 75; if (grade === '2:1') return 65; if (grade === '2:2') return 55;
    if (grade === '3RD') return 45; if (grade === 'FAIL') return 0;
  } else if (systemType === 'us') {
    if (grade === 'A') return 90; if (grade === 'B') return 80; if (grade === 'C') return 70;
    if (grade === 'D') return 60; if (grade === 'F') return 0;
  } else if (systemType === 'in') {
    if (grade === 'O') return 80; if (grade === 'A+') return 70; if (grade === 'A') return 60;
    if (grade === 'B+') return 55; if (grade === 'B') return 50; if (grade === 'C') return 45;
    if (grade === 'P') return 40; if (grade === 'F') return 0;
  }
  return -1;
}

function calculateGradeAndPoints(score: number, systemType: string) {
  let points = 0; let grade = 'F';
  if (systemType === 'ng') {
    if (score >= 70) { points = 5; grade = 'A'; } else if (score >= 60) { points = 4; grade = 'B'; }
    else if (score >= 50) { points = 3; grade = 'C'; } else if (score >= 45) { points = 2; grade = 'D'; }
    else if (score >= 40) { points = 1; grade = 'E'; } else { points = 0; grade = 'F'; }
  } else if (systemType === 'ui') {
    if (score >= 70) { points = 7; grade = 'A'; } else if (score >= 65) { points = 6; grade = 'A-'; }
    else if (score >= 60) { points = 5; grade = 'B+'; } else if (score >= 55) { points = 4; grade = 'B'; }
    else if (score >= 50) { points = 3; grade = 'B-'; } else if (score >= 45) { points = 2; grade = 'C+'; }
    else if (score >= 40) { points = 1; grade = 'C'; } else { points = 0; grade = 'F'; }
  } else if (systemType === 'poly') {
    if (score >= 75) { points = 4.00; grade = 'A'; } else if (score >= 70) { points = 3.50; grade = 'AB'; }
    else if (score >= 65) { points = 3.25; grade = 'B'; } else if (score >= 60) { points = 3.00; grade = 'BC'; }
    else if (score >= 55) { points = 2.75; grade = 'C'; } else if (score >= 50) { points = 2.50; grade = 'CD'; }
    else if (score >= 45) { points = 2.25; grade = 'D'; } else if (score >= 40) { points = 2.00; grade = 'E'; }
    else { points = 0.00; grade = 'F'; }
  } else if (systemType === 'uk') {
    if (score >= 70) { points = 4.00; grade = '1st'; } else if (score >= 60) { points = 3.33; grade = '2:1'; }
    else if (score >= 50) { points = 2.67; grade = '2:2'; } else if (score >= 40) { points = 2.00; grade = '3rd'; }
    else { points = 0.00; grade = 'Fail'; }
  } else if (systemType === 'us') {
    if (score >= 90) { points = 4.0; grade = 'A'; } else if (score >= 80) { points = 3.0; grade = 'B'; }
    else if (score >= 70) { points = 2.0; grade = 'C'; } else if (score >= 60) { points = 1.0; grade = 'D'; }
    else { points = 0; grade = 'F'; }
  } else if (systemType === 'in') {
    if (score >= 80) { points = 10; grade = 'O'; } else if (score >= 70) { points = 9; grade = 'A+'; }
    else if (score >= 60) { points = 8; grade = 'A'; } else if (score >= 55) { points = 7; grade = 'B+'; }
    else if (score >= 50) { points = 6; grade = 'B'; } else if (score >= 45) { points = 5; grade = 'C'; }
    else if (score >= 40) { points = 4; grade = 'P'; } else { points = 0; grade = 'F'; }
  }
  return { points, grade };
}

function getColorForScore(score: number, systemType: string) {
  if (systemType === 'ng' || systemType === 'poly' || systemType === 'ui') {
    if (score >= 60) return '#00b894'; if (score >= 40) return '#fdcb6e'; return '#ff7675';
  } else if (systemType === 'us' || systemType === 'uk' || systemType === 'in') {
    if (score >= 60) return '#00b894'; if (score >= 40) return '#fdcb6e'; return '#ff7675';
  }
  return '#ffffff';
}

interface RawCourse {
  id: string;
  semester: string;
  code: string;
  rawScore: number;
  unit: number;
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [appMode, setAppMode] = useState<'welcome' | 'calculator'>('welcome');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'degree_map'>('dashboard');

  const [showWizard, setShowWizard] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);

  const [studentName, setStudentName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [programDuration, setProgramDuration] = useState(4);
  const [termSystem, setTermSystem] = useState(2);
  const [gradingStandard, setGradingStandard] = useState('ng');

  const [semester, setSemester] = useState('1.1');
  const [courseCode, setCourseCode] = useState('');
  const [courseScore, setCourseScore] = useState('');
  const [courseUnit, setCourseUnit] = useState('');
  const [courses, setCourses] = useState<RawCourse[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterSem, setFilterSem] = useState('all');

  const { user, loading, login, logout } = useUser();
  const syncStatus = useSync(user, courses, studentName, gradingStandard);

  useEffect(() => {
    setIsClient(true);
    const savedGrades = localStorage.getItem("myGrades");
    if (savedGrades) setCourses(JSON.parse(savedGrades));

    const savedProfile = localStorage.getItem("studentProfile");
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      if (p.name) setStudentName(p.name);
      if (p.school) setStudentSchool(p.school);
      if (p.duration) setProgramDuration(p.duration);
      if (p.system) setGradingStandard(p.system);
      if (p.term) setTermSystem(p.term);
    } else {
      setShowWizard(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      setAppMode('calculator');
    }
  }, [user, loading]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("studentProfile", JSON.stringify({ name: studentName, school: studentSchool, duration: programDuration, system: gradingStandard, term: termSystem }));
  }, [studentName, studentSchool, programDuration, gradingStandard, termSystem, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (courses.length > 0) localStorage.setItem("myGrades", JSON.stringify(courses));
    else localStorage.removeItem("myGrades");
  }, [courses, isClient]);

  const handleWizardComplete = (profileData: any) => {
    setStudentName(profileData.name);
    setStudentSchool(profileData.school);
    setGradingStandard(profileData.system);
    setProgramDuration(profileData.duration);
    setTermSystem(profileData.term);
    setShowWizard(false);
    setAppMode('calculator');
  };

  const semesterOptions = [];
  for (let year = 1; year <= programDuration; year++) {
    for (let term = 1; term <= termSystem; term++) {
      semesterOptions.push({ value: `${year}.${term}`, label: `Year ${year} - Term ${term}` });
    }
  }

  const maxScale = gradingStandard === 'in' ? 10.0 : gradingStandard === 'ui' ? 7.0 : gradingStandard === 'ng' ? 5.0 : 4.0;

  const calculatedCourses: CalculatedCourse[] = courses.map(c => {
    const activeScore = Number(c.rawScore !== undefined ? c.rawScore : (c as any).score);
    const { grade, points } = calculateGradeAndPoints(activeScore, gradingStandard);
    const color = getColorForScore(activeScore, gradingStandard);
    return { ...c, currentGrade: grade, currentPoints: points, color, rawScore: activeScore };
  });

  const filteredCourses = filterSem === 'all' ? calculatedCourses : calculatedCourses.filter(c => c.semester === filterSem);

  const totalUnits = calculatedCourses.reduce((sum, c) => sum + c.unit, 0);
  const totalPoints = calculatedCourses.reduce((sum, c) => sum + (c.currentPoints * c.unit), 0);
  const cgpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';

  const semesterGroups: Record<string, { units: number, qp: number }> = {};
  calculatedCourses.forEach(c => {
    if (!semesterGroups[c.semester]) semesterGroups[c.semester] = { units: 0, qp: 0 };
    semesterGroups[c.semester].units += c.unit;
    semesterGroups[c.semester].qp += (c.currentPoints * c.unit);
  });

  const completedCodesSet = new Set(calculatedCourses.map(c => c.code.toUpperCase()));

  const handleSaveCourse = () => {
    if (!courseCode || !courseScore || !courseUnit) return;
    let finalScore;
    const rawInput = courseScore.trim();
    if (!isNaN(Number(rawInput))) { finalScore = Math.round(parseFloat(rawInput)); }
    else {
      finalScore = getScoreFromGrade(rawInput, gradingStandard);
      if (finalScore === -1) { alert(`The grade "${rawInput}" is not valid.`); return; }
    }
    if (finalScore > 100) finalScore = 100;
    if (finalScore < 0) finalScore = 0;

    if (editingId) {
      setCourses(courses.map(c => c.id === editingId ? { ...c, semester, code: courseCode.toUpperCase(), rawScore: finalScore, unit: parseInt(courseUnit) } : c));
      setEditingId(null);
    } else {
      setCourses([...courses, { id: crypto.randomUUID(), semester, code: courseCode.toUpperCase(), rawScore: finalScore, unit: parseInt(courseUnit) }]);
    }
    setCourseCode(''); setCourseScore(''); setCourseUnit('');
  };

  const startEdit = (course: CalculatedCourse) => {
    setEditingId(course.id);
    setSemester(course.semester);
    setCourseCode(course.code);
    setCourseScore(course.rawScore.toString());
    setCourseUnit(course.unit.toString());
  };

  const deleteCourse = (id: string) => {
    if (confirm('Delete this course record?')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  if (!isClient) return null;

  return (
    <main style={{ minHeight: '100vh', padding: '24px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {showWizard && <OnboardingWizard onComplete={handleWizardComplete} />}
      <ComplianceModal isOpen={showCompliance} onClose={() => setShowCompliance(false)} user={user} />

      {appMode === 'welcome' ? (
        <WelcomeScreen
          onStartGuest={() => setAppMode('calculator')}
          onLogin={login}
        />
      ) : (
        <>
          <Navbar
            studentName={studentName}
            studentSchool={studentSchool}
            user={user}
            syncStatus={syncStatus}
            onLogout={logout}
            onLoginClick={() => setAppMode('welcome')}
            onPrivacyClick={() => setShowCompliance(true)}
          />

          <MigrationBanner user={user} />

          {/* Primary Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            background: 'var(--glass-bg, rgba(15, 23, 42, 0.6))',
            padding: '6px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'dashboard' ? '#3b82f6' : 'transparent',
                color: activeTab === 'dashboard' ? '#fff' : '#94a3b8',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
            >
              📊 Academic Dashboard
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'simulator' ? '#8b5cf6' : 'transparent',
                color: activeTab === 'simulator' ? '#fff' : '#94a3b8',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
            >
              🔬 Scenario Workbench
            </button>

            <button
              onClick={() => setActiveTab('degree_map')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'degree_map' ? '#10b981' : 'transparent',
                color: activeTab === 'degree_map' ? '#fff' : '#94a3b8',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
            >
              🗺️ Visual Degree Map
            </button>
          </div>

          {/* TAB 1: ACADEMIC DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <GpaSummaryCard
                cgpa={cgpa}
                totalUnits={totalUnits}
                totalCourses={calculatedCourses.length}
                maxScale={maxScale}
                semesterGroups={semesterGroups}
              />

              <CourseForm
                semester={semester}
                courseCode={courseCode}
                courseScore={courseScore}
                courseUnit={courseUnit}
                editingId={editingId}
                semesterOptions={semesterOptions}
                onSemesterChange={setSemester}
                onCodeChange={setCourseCode}
                onScoreChange={setCourseScore}
                onUnitChange={setCourseUnit}
                onSubmit={handleSaveCourse}
                onCancelEdit={() => setEditingId(null)}
              />

              <CourseTable
                courses={filteredCourses}
                filterSem={filterSem}
                semesterOptions={semesterOptions}
                onFilterChange={setFilterSem}
                onEdit={startEdit}
                onDelete={deleteCourse}
              />

              <TargetCalculator
                totalUnits={totalUnits}
                totalPoints={totalPoints}
                maxScale={maxScale}
              />

              <PathPlanner />
            </>
          )}

          {/* TAB 2: SCENARIO WORKBENCH */}
          {activeTab === 'simulator' && (
            <ScenarioWorkbench
              courses={calculatedCourses}
              maxScale={maxScale}
              gradingStandard={gradingStandard}
            />
          )}

          {/* TAB 3: VISUAL DEGREE MAP */}
          {activeTab === 'degree_map' && (
            <DegreeMap
              courses={[]}
              completedCodes={completedCodesSet}
            />
          )}
        </>
      )}
    </main>
  );
}