import { useState, useCallback, useRef, useEffect } from 'react';
import {
   DndContext, closestCenter, PointerSensor, useSensor, useSensors,
   DragEndEvent,
} from '@dnd-kit/core';
import {
   SortableContext, verticalListSortingStrategy,
   useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TodoItem } from '../TodoItem';
import { Todo } from '../../redux/todosApi';
import { useUpdateTodoMutation, useDelTodoMutation, useAddHistoryMutation } from '../../redux';
import { loadFromLocalStorage } from '../../utils';
import { useAppSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { getTagColor } from '../TagPicker';
import styles from './todoList.module.css';

// ─── типы ────────────────────────────────────────────────────────────────────
type Filter   = 'all' | 'active' | 'completed';
type SortKey  = 'custom' | 'priority' | 'deadline' | 'title' | 'created';

interface TodosListProps { todos?: Todo[] }

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

// ─── Скелетон ────────────────────────────────────────────────────────────────
const Skeleton = () => (
   <div className={styles.skeletonList}>
      {Array.from({ length: 4 }).map((_, i) => (
         <div key={i} className={styles.skeletonItem}>
            <div className={styles.skeletonBar} />
            <div className={styles.skeletonLine} style={{ width: `${55 + i * 10}%` }} />
            <div className={styles.skeletonLine} style={{ width: '35%' }} />
         </div>
      ))}
   </div>
);

// ─── Sortable-обёртка для одного TodoItem ────────────────────────────────────
const SortableTodoItem = ({ todo, index, isDragMode }: { todo: Todo; index: number; isDragMode: boolean }) => {
   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id: todo.id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
   };

   return (
      <div ref={setNodeRef} style={style}>
         <div className={styles.itemRow}>
            {isDragMode && (
               <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
            )}
            <div className={styles.itemBody}>
               <TodoItem index={index} todo={todo} />
            </div>
         </div>
      </div>
   );
};

// ─── Главный компонент ────────────────────────────────────────────────────────
export const TodosList = ({ todos }: TodosListProps) => {
   const [filter, setFilter]     = useState<Filter>('all');
   const [sortKey, setSortKey]   = useState<SortKey>('custom');
   const [sortAsc, setSortAsc]   = useState(true);
   const [search, setSearch]     = useState('');
   const [activeTag, setActiveTag] = useState<string | null>(null);
   const [page, setPage]         = useState(1);

   const userId   = loadFromLocalStorage<string>('user') ?? '';
   const pageSize = useAppSettings().todosPageSize;

   // Reset to first page when page size changes
   useEffect(() => { setPage(1); }, [pageSize]);

   const [updateTodo] = useUpdateTodoMutation();
   const [delTodo]    = useDelTodoMutation();
   const [addHistory] = useAddHistoryMutation();
   const { showToast } = useToast();

   const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

   // ref хранит актуальный sorted — нужен внутри useCallback без нарушения правил хуков
   const sortedRef = useRef<Todo[]>([]);

   const handleDragEnd = useCallback((event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const current = sortedRef.current;
      const oldIndex = current.findIndex(t => t.id === active.id);
      const newIndex = current.findIndex(t => t.id === over.id);
      const reordered = arrayMove(current, oldIndex, newIndex);
      reordered.forEach((todo, i) => {
         if (todo.order !== i) updateTodo({ ...todo, order: i });
      });
   }, [updateTodo]);

   // ── скелетон — после всех хуков ──
   if (!todos) return <Skeleton />;

   // ── все уникальные теги из списка ──
   const allTags = Array.from(new Set(todos.flatMap(t => t.tags ?? [])));

   // ── пайплайн: фильтр → тег → поиск → сортировка ──
   const q = search.trim().toLowerCase();

   const filtered = todos.filter(todo => {
      if (filter === 'active'    && todo.completed)  return false;
      if (filter === 'completed' && !todo.completed) return false;
      if (activeTag && !(todo.tags ?? []).includes(activeTag)) return false;
      if (q && !todo.title.toLowerCase().includes(q)
            && !(todo.description ?? '').toLowerCase().includes(q)
            && !(todo.tags ?? []).join(' ').toLowerCase().includes(q)
            && !(todo.subtasks ?? []).some(s => s.title.toLowerCase().includes(q))) return false;
      return true;
   });

   const handleCompleteAll = () => {
      const active = filtered.filter(t => !t.completed);
      active.forEach(t => updateTodo({ ...t, completed: true }));
      if (active.length) showToast(`✓ ${active.length} task${active.length !== 1 ? 's' : ''} completed`);
   };

   const handleClearCompleted = () => {
      const done = filtered.filter(t => t.completed);
      const ts   = new Date().toISOString();
      done.forEach(t => {
         delTodo(t.id);
         addHistory({ userId, action: 'deleted', title: t.title, timestamp: ts });
      });
      setPage(1);
      if (done.length) showToast(`Removed ${done.length} completed task${done.length !== 1 ? 's' : ''}`, 'error');
   };

   const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
         case 'custom':
            cmp = (a.order ?? 0) - (b.order ?? 0); break;
         case 'priority':
            cmp = (PRIORITY_RANK[a.priority ?? 'medium']) - (PRIORITY_RANK[b.priority ?? 'medium']); break;
         case 'deadline':
            if (!a.deadline && !b.deadline) cmp = 0;
            else if (!a.deadline) cmp = 1;
            else if (!b.deadline) cmp = -1;
            else cmp = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            break;
         case 'title':
            cmp = a.title.localeCompare(b.title); break;
         case 'created':
            if (!a.createdAt && !b.createdAt) cmp = 0;
            else if (!a.createdAt) cmp = 1;
            else if (!b.createdAt) cmp = -1;
            else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
      }
      return sortKey === 'custom' ? cmp : (sortAsc ? cmp : -cmp);
   });

   // обновляем ref каждый рендер — до рендера JSX
   sortedRef.current = sorted;

   const totalPages = Math.ceil(sorted.length / pageSize);
   const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);
   const completedCount = todos.filter(t => t.completed).length;
   const isDragMode = sortKey === 'custom' && !q && !activeTag;

   // ── helpers ──
   const handleFilter = (f: Filter) => { setFilter(f); setPage(1); };
   const handleSearch = (v: string) => { setSearch(v); setPage(1); };
   const handleTag    = (tag: string) => { setActiveTag(t => t === tag ? null : tag); setPage(1); };
   const toggleSort   = (key: SortKey) => {
      if (sortKey === key) setSortAsc(a => !a);
      else { setSortKey(key); setSortAsc(true); }
      setPage(1);
   };
   const sortLabel = (key: SortKey, label: string) => {
      const active = sortKey === key;
      const arrow  = active ? (sortAsc ? ' ↑' : ' ↓') : '';
      return label + (key !== 'custom' ? arrow : '');
   };

   return (
      <div>
         {/* ── Поиск ── */}
         <div className={styles.searchRow}>
            <input
               className={styles.searchInput}
               value={search}
               onChange={e => handleSearch(e.target.value)}
               placeholder="Search tasks…"
            />
            {search && (
               <button className={styles.clearBtn} onClick={() => handleSearch('')}>✕</button>
            )}
         </div>

         {/* ── Теги-фильтры ── */}
         {allTags.length > 0 && (
            <div className={styles.tagFilters}>
               {allTags.map(tag => (
                  <button
                     key={tag}
                     onClick={() => handleTag(tag)}
                     className={styles.tagFilterBtn}
                     style={{
                        borderColor: getTagColor(tag),
                        color: activeTag === tag ? '#fff' : getTagColor(tag),
                        background: activeTag === tag ? getTagColor(tag) : 'transparent',
                     }}
                  >
                     {tag}
                  </button>
               ))}
            </div>
         )}

         {/* ── Сортировка ── */}
         <div className={styles.sortRow}>
            <span className={styles.sortLabel}>Sort:</span>
            {(['custom', 'priority', 'deadline', 'title', 'created'] as SortKey[]).map(key => (
               <button
                  key={key}
                  onClick={() => toggleSort(key)}
                  className={`${styles.sortBtn} ${sortKey === key ? styles.sortBtnActive : ''}`}
               >
                  {sortLabel(key, key === 'custom' ? '⠿ Custom' : key.charAt(0).toUpperCase() + key.slice(1))}
               </button>
            ))}
         </div>

         {/* ── Счётчик + bulk actions + фильтр ── */}
         <div className={styles.header}>
            <span className={styles.counter}>
               {completedCount} of {todos.length} completed
               {sorted.length !== todos.length && ` · ${sorted.length} shown`}
            </span>

            <div className={styles.bulkActions}>
               {filtered.some(t => !t.completed) && (
                  <button className={styles.bulkBtn} onClick={handleCompleteAll}>
                     ✓ Complete all
                  </button>
               )}
               {filtered.some(t => t.completed) && (
                  <button className={`${styles.bulkBtn} ${styles.bulkDel}`} onClick={handleClearCompleted}>
                     ✕ Clear done
                  </button>
               )}
            </div>

            <div className={styles.filters}>
               {(['all', 'active', 'completed'] as Filter[]).map(f => (
                  <button key={f} onClick={() => handleFilter(f)}
                     className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}>
                     {f}
                  </button>
               ))}
            </div>
         </div>

         {/* ── Список ── */}
         {isDragMode ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
               <SortableContext items={sorted.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <ul className={styles.list}>
                     {paginated.length > 0
                        ? paginated.map((todo, i) => (
                           <SortableTodoItem
                              key={todo.id}
                              todo={todo}
                              index={(page - 1) * pageSize + i}
                              isDragMode={isDragMode}
                           />
                        ))
                        : <EmptyState filter={filter} search={q} />
                     }
                  </ul>
               </SortableContext>
            </DndContext>
         ) : (
            <ul className={styles.list}>
               {paginated.length > 0
                  ? paginated.map((todo, i) => (
                     <TodoItem key={todo.id} index={(page - 1) * pageSize + i} todo={todo} />
                  ))
                  : <EmptyState filter={filter} search={q} />
               }
            </ul>
         )}

         {/* ── Пагинация ── */}
         {totalPages > 1 && (
            <div className={styles.pagination}>
               <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
               {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                     return (
                        <button key={p} onClick={() => setPage(p)}
                           className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}>{p}</button>
                     );
                  if (Math.abs(p - page) === 2) return <span key={p} className={styles.pageDots}>…</span>;
                  return null;
               })}
               <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
            </div>
         )}
      </div>
   );
};

const EmptyState = ({ filter, search }: { filter: Filter; search: string }) => (
   <div className={styles.empty}>
      <span className={styles.emptyIcon}>○</span>
      <p>No tasks found</p>
      <p className={styles.emptyHint}>
         {search ? `No results for "${search}"` : filter === 'all' ? 'Add your first task above' : `No ${filter} tasks`}
      </p>
   </div>
);
