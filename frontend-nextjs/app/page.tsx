'use client';

import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Chart from 'chart.js/auto';

// --- EXACT V1 LOGIC RESTORED ---

function getScoreFromGrade(gradeInput: string, systemType: string) {
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
    } else if (systemType === 'us') {
        if (score >= 80) return '#00b894'; if (score >= 60) return '#fdcb6e'; return '#ff7675';
    } else if (systemType === 'uk') {
        if (score >= 60) return '#00b894'; if (score >= 40) return '#fdcb6e'; return '#ff7675';
    } else if (systemType === 'in') {
        if (score >= 60) return '#00b894'; if (score >= 40) return '#fdcb6e'; return '#ff7675';
    }
    return '#ffffff';
}

interface Course {
  id: string;
  semester: string;
  code: string;
  rawScore: number; 
  unit: number;
}

export default function Home() {
  // STATE MANAGEMENT
  const [studentName, setStudentName] = useState('Adeyemi Daniel Adeniji');
  const [studentSchool, setStudentSchool] = useState('');
  
  const [programDuration, setProgramDuration] = useState(4);
  const [termSystem, setTermSystem] = useState(2);
  const [gradingStandard, setGradingStandard] = useState('ng');
  
  const [semester, setSemester] = useState('1.1');
  const [courseCode, setCourseCode] = useState('');
  const [courseScore, setCourseScore] = useState('');
  const [courseUnit, setCourseUnit] = useState('');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterSem, setFilterSem] = useState('all');

  const [targetGPA, setTargetGPA] = useState('4.65');
  const [nextUnits, setNextUnits] = useState('');
  const [targetResult, setTargetResult] = useState('');

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // SEMESTER DROPDOWN LOGIC
  const semesterOptions = [];
  for (let year = 1; year <= programDuration; year++) {
    for (let term = 1; term <= termSystem; term++) {
      semesterOptions.push({ value: `${year}.${term}`, label: `Year ${year} - Term ${term}` });
    }
  }

  // DYNAMIC CALCULATION ENGINE
  const maxScale = gradingStandard === 'in' ? 10.0 : gradingStandard === 'ui' ? 7.0 : gradingStandard === 'ng' ? 5.0 : 4.0;
  
  const calculatedCourses = courses.map(c => {
    const { grade, points } = calculateGradeAndPoints(c.rawScore, gradingStandard);
    const color = getColorForScore(c.rawScore, gradingStandard);
    return { ...c, currentGrade: grade, currentPoints: points, color };
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

  // CONFETTI
  useEffect(() => {
    if (parseFloat(cgpa) >= (maxScale * 0.9) && courses.length > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [cgpa, maxScale, courses.length]);

  // CHART.JS RESTORATION
  useEffect(() => {
    if (chartInstance.current) chartInstance.current.destroy();
    if (courses.length === 0 || !chartRef.current) return;

    const labels = Object.keys(semesterGroups).sort();
    const dataPoints = labels.map(sem => (semesterGroups[sem].qp / semesterGroups[sem].units).toFixed(2));

    chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'GPA Trend',
                data: dataPoints,
                borderColor: '#00b894',
                backgroundColor: 'rgba(0, 184, 148, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: maxScale, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
                x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } }
            },
            plugins: { legend: { labels: { color: 'white' } } }
        }
    });
  }, [courses, gradingStandard]); // Redraws if courses or scale changes

  // FORM ACTIONS
  const handleSaveCourse = () => {
    if (!courseCode || !courseScore || !courseUnit) return;

    let finalScore;
    const rawInput = courseScore.trim();
    
    // Exact V1 String/Number conversion logic
    if (!isNaN(Number(rawInput))) {
        finalScore = Math.round(parseFloat(rawInput));
    } else {
        finalScore = getScoreFromGrade(rawInput, gradingStandard);
        if (finalScore === -1) {
            alert(`The grade "${rawInput}" is not valid for the selected grading system.`);
            return;
        }
    }

    if (finalScore > 100) finalScore = 100;
    if (finalScore < 0) finalScore = 0;

    if (editingId) {
      setCourses(courses.map(c => c.id === editingId ? {
        ...c, semester, code: courseCode.toUpperCase(), rawScore: finalScore, unit: parseInt(courseUnit)
      } : c));
      setEditingId(null);
    } else {
      setCourses([...courses, {
        id: crypto.randomUUID(), semester, code: courseCode.toUpperCase(), rawScore: finalScore, unit: parseInt(courseUnit)
      }]);
    }

    setCourseCode(''); setCourseScore(''); setCourseUnit('');
  };

  const startEdit = (course: any) => {
    setEditingId(course.id);
    setSemester(course.semester);
    setCourseCode(course.code);
    setCourseScore(course.rawScore.toString());
    setCourseUnit(course.unit.toString());
  };

  const calculateTarget = () => {
    const target = parseFloat(targetGPA);
    const units = parseFloat(nextUnits);
    if (!target || !units) {
      setTargetResult("Please enter both a Goal and Next Units."); return;
    }
    const requiredGPA = ((target * (totalUnits + units)) - totalPoints) / units;
    
    if (requiredGPA > maxScale) setTargetResult(`⚠️ Impossible! You need ${requiredGPA.toFixed(2)} (Max is ${maxScale}).`);
    else if (requiredGPA < 0) setTargetResult(`🎉 You're already above this target!`);
    else setTargetResult(`🎯 Aim for a ${requiredGPA.toFixed(2)} GPA next semester.`);
  };

  return (
    <>
      <div id="profile-card">
        <div className="profile-image-container">
            <img id="profile-img" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" />
        </div>
        <div className="profile-details">
            <input type="text" placeholder="Enter Name" className="transparent-input" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            <input type="text" placeholder="University / Program" className="transparent-input small" value={studentSchool} onChange={(e) => setStudentSchool(e.target.value)} />

            <div className="settings-row">
                <select value={programDuration} onChange={(e) => setProgramDuration(Number(e.target.value))}>
                    <option value="2">Diploma (2 Years)</option><option value="3">HND / Degree (3 Years)</option>
                    <option value="4">Degree (4 Years)</option><option value="5">Engineering/Law (5 Years)</option>
                    <option value="6">Medicine (6 Years)</option>
                </select>
                <div className="system-select-container">
                    <label>Terms:</label>
                    <select value={termSystem} onChange={(e) => setTermSystem(Number(e.target.value))}>
                        <option value="2">Semester (2)</option><option value="3">Trimester (3)</option>
                    </select>
                </div>
                <div className="system-select-container">
                    <label>Scale:</label>
                    <select value={gradingStandard} onChange={(e) => setGradingStandard(e.target.value)}>
                        <optgroup label="🇳🇬 Nigeria">
                            <option value="ng">Standard (5.0)</option><option value="poly">Polytechnic (4.0)</option><option value="ui">7.0 Scale (Special/PG)</option>
                        </optgroup>
                        <optgroup label="🌍 Global">
                            <option value="uk">🇬🇧 UK (Percentage)</option><option value="us">🇺🇸 USA (4.0)</option><option value="in">🇮🇳 India (10.0)</option>
                        </optgroup>
                    </select>
                </div>
            </div>
        </div>
      </div>
      
      <br />
      <h1>My Student OS</h1>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <a href="https://www.youtube.com/watch?v=IumhoUINbzU" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <button className="demo-btn">▶️ Watch How it Works</button>
          </a>
      </div>
      <br />

      <div id="grade-calculator">
          <h3>{editingId ? '📝 Edit Course' : 'Add a Course'}</h3>
          <div className="input-row">
              <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                {semesterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <input type="text" placeholder="Course Code (e.g. CIT215)" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
          </div>
          <div className="input-row">
              <input type="text" placeholder="Score (e.g. 70) or Grade (e.g. A)" value={courseScore} onChange={(e) => setCourseScore(e.target.value)} />
              <input type="number" min="0" step="1" placeholder="Units" value={courseUnit} onChange={(e) => setCourseUnit(e.target.value)} />
              <button onClick={handleSaveCourse}>{editingId ? 'Update' : 'Add Course'}</button>
          </div>
      </div>
      <br />
      
      <div className="filter-area">
          <label>Filter View: </label>
          <select value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
              <option value="all">Show All Terms</option>
              {semesterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
      </div>
      <br />

      <h2>Course Registry</h2>
      <div className="table-container">
          <table>
              <thead>
                  <tr><th>Sem</th><th>Code</th><th>Unit</th><th>Score</th><th>Grd</th><th>Pts</th><th>QP</th><th>Action</th></tr>
              </thead>
              <tbody>
                  {filteredCourses.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#b2bec3' }}>📭 No courses added yet</td></tr>
                  ) : (
                    filteredCourses.map(c => (
                      <tr key={c.id}>
                        <td>{c.semester}</td><td>{c.code}</td><td>{c.unit}</td><td>{c.rawScore}</td>
                        <td style={{ color: c.color, fontWeight: 'bold' }}>{c.currentGrade}</td>
                        <td>{c.currentPoints}</td><td>{(c.currentPoints * c.unit).toFixed(2)}</td>
                        <td>
                          <button className="delete-btn" style={{ marginRight: '5px', borderColor: '#6c5ce7', color: '#6c5ce7' }} onClick={() => startEdit(c)}>✎</button>
                          <button className="delete-btn" onClick={() => setCourses(courses.filter(item => item.id !== c.id))}>X</button>
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
          </table>
      </div>

      <div id="result-area" className={parseFloat(cgpa) >= (maxScale * 0.7) ? 'status-green' : parseFloat(cgpa) >= (maxScale * 0.5) ? 'status-orange' : 'status-red'}>
          <h3>Cumulative GPA: <span id="gpaScore" className={parseFloat(cgpa) >= (maxScale * 0.7) ? 'status-green' : parseFloat(cgpa) >= (maxScale * 0.5) ? 'status-orange' : 'status-red'}>{cgpa}</span> / {maxScale.toFixed(2)}</h3>
          <div className="stats-row">
              <div className="stat-badge">📚 Total Courses: <span>{courses.length}</span></div>
              <div className="stat-badge">⚡ Total Units: <span>{totalUnits}</span></div>
          </div>
      </div>

      {courses.length > 0 && (
          <div className="chart-container">
              <canvas ref={chartRef}></canvas>
          </div>
      )}

      <div id="semester-summaries" className="summary-grid">
        {Object.keys(semesterGroups).sort().map(sem => {
          const semGPA = (semesterGroups[sem].qp / semesterGroups[sem].units).toFixed(2);
          const isGood = parseFloat(semGPA) >= (maxScale * 0.7);
          return (
            <div key={sem} className="summary-card">
              <div className="summary-sem">Year {sem}</div>
              <div className={`summary-gpa ${isGood ? 'status-green' : 'status-orange'}`}>{semGPA}</div>
            </div>
          )
        })}
      </div>

      <div className="action-bar">
          <button onClick={() => window.print()} className="action-btn">🖨️ Save PDF</button>
          <button onClick={() => { if(confirm("⚠️ Wipe ALL data?")) setCourses([]) }} className="action-btn delete-mode">🗑️ Reset</button>
          <a href="https://www.buymeacoffee.com/adeyemiadeniji" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button className="action-btn coffee-btn">☕ Buy me a Coffee</button>
          </a>
      </div>
      <br />

      <div id="target-calculator">
          <h3>🎯 Target GPA Manager</h3>
          <p className="target-subtitle">Current CGPA: <span id="targetCurrentCGPA">{cgpa}</span></p>
          <div className="target-inputs">
              <input type="number" min="0" step="0.1" placeholder="Goal CGPA" value={targetGPA} onChange={(e) => setTargetGPA(e.target.value)} />
              <input type="number" min="0" step="1" placeholder="Units Next Sem" value={nextUnits} onChange={(e) => setNextUnits(e.target.value)} />
              <button onClick={calculateTarget} className="target-btn">Check Required GPA</button>
          </div>
          <p id="targetResult" style={{ color: targetResult.includes('Impossible') ? '#ff7675' : targetResult.includes('already') ? '#00b894' : 'white' }}>{targetResult}</p>
      </div>

      <div className="footer">
          <p>© 2026 Adeyemi Adeniji. All Rights Reserved.</p>
      </div>
    </>
  );
}