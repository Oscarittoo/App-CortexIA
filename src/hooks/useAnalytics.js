import { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

export const useSearchSessions = (sessions, query, filters = {}) => {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query && Object.keys(filters).length === 0) {
      setResults(sessions);
      return;
    }

    setIsSearching(true);

    const searchResults = sessions.filter(session => {
      let matches = true;

      if (query) {
        const lowerQuery = query.toLowerCase();
        const titleMatch = session.title?.toLowerCase().includes(lowerQuery);
        const transcriptMatch = session.transcript?.some(t => 
          typeof t === 'string' 
            ? t.toLowerCase().includes(lowerQuery)
            : t.text?.toLowerCase().includes(lowerQuery)
        );
        const summaryMatch = session.summary?.toLowerCase().includes(lowerQuery);
        const tagsMatch = session.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));

        matches = matches && (titleMatch || transcriptMatch || summaryMatch || tagsMatch);
      }

      if (filters.tags && filters.tags.length > 0) {
        matches = matches && filters.tags.every(tag => session.tags?.includes(tag));
      }

      if (filters.dateRange) {
        const sessionDate = new Date(session.createdAt);
        
        if (filters.dateRange === 'today') {
          matches = matches && format(sessionDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        } else if (filters.dateRange === 'week') {
          const weekStart = startOfWeek(new Date());
          const weekEnd = endOfWeek(new Date());
          matches = matches && sessionDate >= weekStart && sessionDate <= weekEnd;
        } else if (filters.dateRange === 'month') {
          const monthStart = startOfMonth(new Date());
          const monthEnd = endOfMonth(new Date());
          matches = matches && sessionDate >= monthStart && sessionDate <= monthEnd;
        } else if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
          matches = matches && sessionDate >= new Date(filters.startDate) && sessionDate <= new Date(filters.endDate);
        }
      }

      if (filters.minDuration) {
        matches = matches && (session.duration || 0 >= filters.minDuration * 60);
      }

      if (filters.hasActions !== undefined) {
        matches = matches && (filters.hasActions ? (session.actions?.length > 0) : true);
      }

      if (filters.hasDecisions !== undefined) {
        matches = matches && (filters.hasDecisions ? (session.decisions?.length > 0) : true);
      }

      return matches;
    });

    setResults(searchResults);
    setIsSearching(false);
  }, [sessions, query, filters]);

  return { results, isSearching };
};

export const useTagManager = (initialTags = []) => {
  const [tags, setTags] = useState(initialTags);
  const [tagColors, setTagColors] = useState({});

  useEffect(() => {
    const savedTags = localStorage.getItem('cortexai_tags');
    if (savedTags) {
      const parsed = JSON.parse(savedTags);
      setTags(parsed.tags || []);
      setTagColors(parsed.colors || {});
    }
  }, []);

  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      saveTags(newTags, tagColors);
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter(t => t !== tag);
    const newColors = { ...tagColors };
    delete newColors[tag];
    setTags(newTags);
    setTagColors(newColors);
    saveTags(newTags, newColors);
  };

  const setTagColor = (tag, color) => {
    const newColors = { ...tagColors, [tag]: color };
    setTagColors(newColors);
    saveTags(tags, newColors);
  };

  const saveTags = (tagsData, colorsData) => {
    localStorage.setItem('cortexai_tags', JSON.stringify({
      tags: tagsData,
      colors: colorsData,
    }));
  };

  return {
    tags,
    tagColors,
    addTag,
    removeTag,
    setTagColor,
  };
};

export const useSessionAnalytics = (sessions) => {
  return useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
        totalActions: 0,
        totalDecisions: 0,
        sessionsThisWeek: 0,
        sessionsThisMonth: 0,
        topTags: [],
        sessionsByDay: [],
        sessionsByTag: {},
      };
    }

    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalActions = sessions.reduce((acc, s) => acc + (s.actions?.length || 0), 0);
    const totalDecisions = sessions.reduce((acc, s) => acc + (s.decisions?.length || 0), 0);
    
    const sessionsThisWeek = sessions.filter(s => new Date(s.createdAt) >= weekStart).length;
    const sessionsThisMonth = sessions.filter(s => new Date(s.createdAt) >= monthStart).length;
    
    const tagCounts = {};
    sessions.forEach(session => {
      session.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = sessions.filter(s => format(new Date(s.createdAt), 'yyyy-MM-dd') === dateStr).length;
      return {
        date: format(date, 'EEE'),
        count,
      };
    });
    
    return {
      totalSessions: sessions.length,
      totalDuration,
      averageDuration: Math.floor(totalDuration / sessions.length),
      totalActions,
      totalDecisions,
      sessionsThisWeek,
      sessionsThisMonth,
      topTags,
      sessionsByDay: last7Days,
      sessionsByTag: tagCounts,
    };
  }, [sessions]);
};
