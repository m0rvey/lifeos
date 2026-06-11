import { Depth, Archetype, PersonStatus } from '../types';
import type { AppData } from '../types';
import { todayISO, nowISO } from '../cognitive/helpers';
import rawWorkouts from '../data/cycling_workouts.json';

export function getDefaultData(): AppData {
  const rides = rawWorkouts.map((w, index) => {
    // Parse w.start or fallback
    const startStr = w.start;
    let createdAt = nowISO();
    if (startStr) {
      // "2026-05-22 12:43" -> replace space with T
      const isoStr = startStr.replace(' ', 'T') + ':00Z';
      try {
        const parsedDate = new Date(isoStr);
        if (!isNaN(parsedDate.getTime())) {
          createdAt = parsedDate.toISOString();
        }
      } catch {
        // ignore
      }
    }

    return {
      id: `r${String(index + 1).padStart(3, '0')}`,
      dateISO: w.date || todayISO(),
      title: w.workout_type || 'Велоспорт',
      distanceKm: Math.round(w.distance_km * 100) / 100,
      durationMin: Math.round(w.duration_seconds / 60) || 1,
      avgSpeedKmh: w.avg_speed_kmh || 0,
      maxSpeedKmh: w.max_speed_kmh || 0,
      elevationGainM: w.elevation_gain_m || 0,
      avgPowerW: null,
      avgHrBpm: w.avg_heart_rate || null,
      description: 'Импортированная тренировка',
      routeId: null,
      createdAt,
      updatedAt: createdAt,
    };
  });

  return {
    version: 3,
    settings: {
      theme: 'mindveyz',
      accentColor: 'purple',
      fontSizeScale: 1.0,
      isAdaptive: true,
      graphSensitivity: 5,
      graphWeights: {
        energy: 0.42,
        resonance: 0.3,
        reciprocity: 0.24,
        volatility: 0.2,
        recency: 0.15,
      },
      weekStartDay: 1, // Понедельник
    },
    people: [
      {
        id: 'demo_1',
        name: 'Александр',
        depth: Depth.CORE,
        archetype: Archetype.INTELLECTUAL,
        status: PersonStatus.ACTIVE,
        energy: 85,
        resonance: 78,
        reciprocity: 72,
        volatility: 25,
        lastContactISO: todayISO(),
        reflection: 'Глубокий диалог о философии системного мышления. Заряжает энергией на неделю вперед.',
        notes: 'Обсудить проект единого хаба в следующие выходные.',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
      {
        id: 'demo_2',
        name: 'Елизавета',
        depth: Depth.INNER,
        archetype: Archetype.EMOTIONAL,
        status: PersonStatus.ACTIVE,
        energy: 90,
        resonance: 92,
        reciprocity: 86,
        volatility: 20,
        lastContactISO: todayISO(),
        reflection: 'Приятное, поддерживающее общение. Обменялись книжными рекомендациями.',
        notes: 'Подарить книгу при следующей встрече.',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
      {
        id: 'demo_3',
        name: 'Михаил',
        depth: Depth.SOCIAL,
        archetype: Archetype.BUSINESS,
        status: PersonStatus.OCCASIONAL,
        energy: 62,
        resonance: 66,
        reciprocity: 58,
        volatility: 34,
        lastContactISO: todayISO(),
        reflection: 'Сугубо рабочие вопросы. Обсудили разработку API и интеграции.',
        notes: 'Жду от него коммиты по бэкенду.',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
      {
        id: 'demo_4',
        name: 'Анна',
        depth: Depth.PERIPHERY,
        archetype: Archetype.EMOTIONAL,
        status: PersonStatus.DISTANT,
        energy: 54,
        resonance: 60,
        reciprocity: 55,
        volatility: 30,
        lastContactISO: todayISO(),
        reflection: 'Давняя знакомая. Общаемся редко, но душевно.',
        notes: 'Поздравить с днем рождения в августе.',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
    ],
    tasks: [
      {
        id: 'task_1',
        title: 'Ознакомиться с платформой',
        description: 'Изучить все модули новой платформы m0rveyZ.',
        emotion: 40,
        urgency: 50,
        deadlineISO: null,
        isCompleted: false,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
      {
        id: 'task_2',
        title: 'Провести рефлексию недели',
        description: 'Проанализировать успехи и выгорание по шкале усталости.',
        emotion: 80,
        urgency: 40,
        deadlineISO: null,
        isCompleted: false,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
    ],
    transactions: [
      { id: 'tx_1', type: 'income', amount: 120000, category: 'Работа', description: 'Основная зарплата', dateISO: todayISO(), createdAt: nowISO(), updatedAt: nowISO() },
      { id: 'tx_2', type: 'expense', amount: 4500, category: 'Еда', description: 'Продукты на неделю', dateISO: todayISO(), createdAt: nowISO(), updatedAt: nowISO() },
    ],
    reminders: [
      { id: 'rem_1', title: 'Оплата за интернет', amount: 650, dueDateISO: todayISO(), isPaid: false, category: 'Сервисы', remindDaysBefore: 1, createdAt: nowISO(), updatedAt: nowISO() },
      { id: 'rem_2', title: 'Аренда квартиры', amount: 45000, dueDateISO: todayISO(), isPaid: false, category: 'Жилье', remindDaysBefore: 3, createdAt: nowISO(), updatedAt: nowISO() },
    ],
    rides,
    routes: [
      { id: 'rt_1', name: 'Озерный круг', distanceKm: 55, elevationGainM: 320, difficulty: 'medium', waypoints: ['Город', 'Озеро', 'Лес', 'Город'], isCompleted: false, createdAt: nowISO(), updatedAt: nowISO() },
      { id: 'rt_2', name: 'Горный вызов', distanceKm: 90, elevationGainM: 1100, difficulty: 'hard', waypoints: ['Старт', 'Перевал', 'Вершина', 'Спуск'], isCompleted: false, createdAt: nowISO(), updatedAt: nowISO() },
    ],
    maintenance: [
      { id: 'maint_1', bikePart: 'Цепь', type: 'replace', description: 'Износ 70%, замена цепи', cost: 1500, dateISO: todayISO(), isDone: true, createdAt: nowISO(), updatedAt: nowISO() },
      { id: 'maint_2', bikePart: 'Тормозные колодки', type: 'inspection', description: 'Проверка износа колодок', cost: 0, dateISO: todayISO(), isDone: false, createdAt: nowISO(), updatedAt: nowISO() },
    ],
    galleryNotes: [
      { id: 'gall_1', title: 'Первый заезд сезона', content: 'Отличная погода, прекрасный накат. Новые покрышки держат отлично.', color: 'blue', tags: ['вело', 'весна'], isPinned: true, rideId: null, createdAt: nowISO(), updatedAt: nowISO() },
    ],
    journal: [
      { id: 'journ_1', title: 'Старт новой системы', content: 'Сегодня я начинаю использовать m0rveyZ Platform. Все проекты объединены в одно приложение.', mood: 85, dateISO: todayISO(), createdAt: nowISO(), updatedAt: nowISO() },
    ],
    knowledge: [
      { id: 'know_1', title: 'Закон Хика', content: 'Время принятия решения возрастает логарифмически от количества вариантов. Меньше вариантов — быстрее решение.', category: 'Психология', source: 'UX дизайн', url: '', tags: ['психология', 'проектирование'], createdAt: nowISO(), updatedAt: nowISO() },
      { id: 'know_2', title: 'Правило 80/20', content: '20% усилий дают 80% результата. Сфокусируйтесь на главном.', category: 'Продуктивность', source: 'Парето', url: '', tags: ['фокус', 'тайм-менеджмент'], createdAt: nowISO(), updatedAt: nowISO() },
    ],
    schedule: [
      { id: 'sb_1', title: 'Работа над проектами', dateISO: todayISO(), startTime: '09:00', durationMin: 240, type: 'work', isCompleted: false, createdAt: nowISO(), updatedAt: nowISO() },
      { id: 'sb_2', title: 'Велотренировка', dateISO: todayISO(), startTime: '18:00', durationMin: 90, type: 'health', isCompleted: false, createdAt: nowISO(), updatedAt: nowISO() },
    ],
    habits: [
      { id: 'habit_1', title: 'Позвонить другу', category: 'social', completedDates: [], isActive: true, createdAt: nowISO(), updatedAt: nowISO() },
      { id: 'habit_2', title: 'Отправить благодарность', category: 'social', completedDates: [], isActive: true, createdAt: nowISO(), updatedAt: nowISO() },
      { id: 'habit_3', title: 'Новое знакомство', category: 'social', completedDates: [], isActive: true, createdAt: nowISO(), updatedAt: nowISO() },
      { id: 'habit_4', title: 'Глубокий разговор', category: 'social', completedDates: [], isActive: true, createdAt: nowISO(), updatedAt: nowISO() },
    ],
    workouts: [
      { id: 'work_1', dateISO: todayISO(), type: 'gym', durationMin: 60, intensity: 4, description: 'Силовая тренировка в зале', calories: 450, createdAt: nowISO(), updatedAt: nowISO() },
    ],
    thoughts: [
      { id: 'thou_1', content: 'Дисциплина — это выбор между тем, чего вы хотите сейчас, и тем, чего вы хотите больше всего.', category: 'Дисциплина', tags: ['жизнь', 'фокус'], createdAt: nowISO(), updatedAt: nowISO() },
    ],
    fatigue: 10,
  };
}
