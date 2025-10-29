/**
 * Demo Templates Hook
 * Replaces Convex templates hook with demo store
 */

import { useDemoTemplatesStore } from "../stores/demoTemplatesStore";
import { useState, useMemo } from "react";

interface UseTemplatesOptions {
  userId?: string;
  selectedDate?: string;
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const { templates, getTemplateById } = useDemoTemplatesStore();
  const [activeTemplate, setActiveTemplate] = useState<any>(null);

  // Get the active template or first template as default
  const effectiveActiveTemplate = useMemo(() => {
    if (activeTemplate) return activeTemplate;
    return templates[0] || null;
  }, [activeTemplate, templates]);

  // Get current form fields from active template
  const currentFormFields = useMemo(() => {
    const template = effectiveActiveTemplate;
    return template?.fields || [];
  }, [effectiveActiveTemplate]);

  const saveTemplate = async (template: any, setAsActive: boolean = false) => {
    const store = useDemoTemplatesStore.getState();
    
    if (template._id) {
      // Update existing
      store.updateTemplate(template._id, template);
      if (setAsActive) {
        setActiveTemplate(template);
      }
    } else {
      // Create new
      const newTemplate = store.createTemplate(
        template.name,
        template.content,
        template.description,
        template.category
      );
      if (setAsActive) {
        setActiveTemplate(newTemplate);
      }
    }
  };

  return {
    templates,
    activeTemplate: effectiveActiveTemplate,
    currentFormFields,
    isLoading: false,
    setActiveTemplate,
    saveTemplate,
    deleteTemplate: async () => {},
    duplicateTemplate: async () => {},
    setTemplateForDay: () => {},
    getEffectiveActiveTemplate: () => effectiveActiveTemplate,
  };
}
