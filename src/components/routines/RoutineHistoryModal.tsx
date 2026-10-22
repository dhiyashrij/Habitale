import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Routine } from '../../types';
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';

interface RoutineHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: Routine | null;
}

export const RoutineHistoryModal: React.FC<RoutineHistoryModalProps> = ({
  isOpen,
  onClose,
  routine,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  if (!routine) return null;

  // Past 14 days list for quick picker
  const pastDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isDone = routine.completedDates.includes(dateStr);
    const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { dateStr, label, isDone };
  });

  const isRoutineDoneOnSelected = routine.completedDates.includes(selectedDate);

  // Sub-tasks status on selected date
  const tasksDoneCount = (routine.tasks || []).filter(t => (t.completedDates || []).includes(selectedDate)).length;
  const totalTasks = (routine.tasks || []).length;
  const taskPct = totalTasks > 0 ? Math.round((tasksDoneCount / totalTasks) * 100) : isRoutineDoneOnSelected ? 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${routine.title} — History`}
      subtitle="View your past completion records across dates."
      maxWidth="540px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Quick Date Chips */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Select a Recent Date
          </label>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
            {pastDates.map(item => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(item.dateStr)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 600 : 400,
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--card-border)',
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--card-bg)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {item.isDone ? (
                    <CheckCircle2 size={13} color="var(--primary)" />
                  ) : (
                    <Circle size={11} color="var(--text-light)" />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Selector input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={16} color="var(--text-muted)" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--card-border)',
              backgroundColor: 'var(--bg-canvas)',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
            }}
          />
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Showing records for <strong>{selectedDate}</strong>
          </span>
        </div>

        {/* Completion Status Capsule */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-canvas-subtle)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {isRoutineDoneOnSelected ? 'Routine Completed' : tasksDoneCount > 0 ? 'Partially Completed' : 'Not Completed'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {totalTasks > 0 ? `${tasksDoneCount} of ${totalTasks} tasks fulfilled` : 'Single habit completion'}
            </div>
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: isRoutineDoneOnSelected || taskPct === 100 ? 'var(--primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {taskPct}%
          </div>
        </div>

        {/* Sub-tasks record list */}
        {totalTasks > 0 && (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Individual Tasks on this Date
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {routine.tasks.map(task => {
                const isTaskDone = (task.completedDates || []).includes(selectedDate);
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {isTaskDone ? (
                        <CheckCircle2 size={16} color="var(--primary)" />
                      ) : (
                        <Circle size={16} color="var(--text-light)" />
                      )}
                      <span
                        style={{
                          fontSize: '0.88rem',
                          color: isTaskDone ? 'var(--text-main)' : 'var(--text-muted)',
                          textDecoration: isTaskDone ? 'none' : 'none',
                          fontWeight: isTaskDone ? 500 : 400,
                        }}
                      >
                        {task.title}
                      </span>
                    </div>

                    {task.time && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Clock size={12} />
                        <span>{task.time}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Close History
          </button>
        </div>
      </div>
    </Modal>
  );
};
