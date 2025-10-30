// Demo mode: useTemplates hook with local template management
// No Convex backend - all data is ephemeral

import { Template, TemplateField } from "@/app/dashboard/_components/Templates";
import { useEffect, useState } from "react";
import { useTemplateStore } from "@/store/templateStore";

interface UseTemplatesProps {
  userId?: string;
  selectedDate?: string;
}

export function useTemplates({ userId, selectedDate }: UseTemplatesProps) {
  console.log("🚀 useTemplates CALLED!", { userId, selectedDate });
  
  // Zustand store for per-day template state
  const { getDayTemplate, setDayTemplate } = useTemplateStore();
  
  // Local state for demo templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get default template fields - DEFINE BEFORE USE
  const getDefaultFields = (): TemplateField[] => {
    return [
      {
        id: "overallMood",
        type: "slider",
        label: "Overall Mood",
        min: 1,
        max: 10,
        defaultValue: 5,
        category: "ratings",
        required: true,
      },
      {
        id: "workSatisfaction",
        type: "slider",
        label: "Work Satisfaction",
        min: 1,
        max: 10,
        defaultValue: 5,
        category: "ratings",
        required: true,
      },
      {
        id: "personalLifeSatisfaction",
        type: "slider",
        label: "Personal Life",
        min: 1,
        max: 10,
        defaultValue: 5,
        category: "ratings",
        required: true,
      },
      {
        id: "balanceRating",
        type: "slider",
        label: "Work-Life Balance",
        min: 1,
        max: 10,
        defaultValue: 5,
        category: "ratings",
        required: true,
      },
      {
        id: "sleep",
        type: "number",
        label: "Hours of sleep",
        min: 0,
        max: 24,
        step: 0.5,
        defaultValue: 7,
        category: "wellness",
        required: true,
      },
      {
        id: "exercise",
        type: "checkbox",
        label: "Exercise today?",
        defaultValue: false,
        category: "wellness",
      },
      {
        id: "highlights",
        type: "textarea",
        label: "Today's highlight",
        placeholder: "What was the best part of your day?",
        category: "reflections",
      },
      {
        id: "challenges",
        type: "textarea",
        label: "Today's challenge",
        placeholder: "What was challenging?",
        category: "reflections",
      },
      {
        id: "tomorrowGoal",
        type: "textarea",
        label: "Tomorrow's focus",
        placeholder: "What's your main focus for tomorrow?",
        category: "reflections",
      },
    ];
  };

  // Initialize demo templates on mount
  useEffect(() => {
    const defaultTemplate: Template = {
      id: "template_default",
      name: "A New Beginning.",
      fields: getDefaultFields(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates([defaultTemplate]);
    setActiveTemplateId(defaultTemplate.id);
    setIsLoading(false);

    console.log("🔍 Demo useTemplates initialized with default template", {
      fieldsCount: defaultTemplate.fields.length,
      fields: defaultTemplate.fields.map(f => f.id)
    });
  }, []);

  // Debug logging
  console.log("🔍 Demo useTemplates:", {
    userId,
    selectedDate,
    templatesCount: templates.length,
    activeTemplateId,
    isLoading,
    firstTemplateFields: templates[0]?.fields?.length
  });

  // Get the effective active template for the current day
  const getEffectiveActiveTemplate = () => {
    console.log("🔍 Demo getEffectiveActiveTemplate:", { selectedDate, templatesLength: templates.length, activeTemplateId });
    
    if (!selectedDate || !templates.length) {
      const active = templates.find(t => t.id === activeTemplateId);
      console.log("🔍 Returning active template:", active?.name);
      return active || null;
    }
    
    // Check if there's a stored template for this specific day
    const dayTemplateId = getDayTemplate(selectedDate);
    console.log("🔍 Day template ID for", selectedDate, ":", dayTemplateId);
    
    if (dayTemplateId) {
      const dayTemplate = templates.find(t => t.id === dayTemplateId);
      if (dayTemplate) {
        console.log("🔍 Found day template:", dayTemplate.name);
        return dayTemplate;
      }
    }
    
    // Fall back to default template
    const defaultTemplate = templates.find(t => t.name === "A New Beginning.");
    console.log("🔍 Returning default template:", defaultTemplate?.name);
    return defaultTemplate || null;
  };

  // Helper functions (demo mode: all no-ops or local state updates)
  const saveTemplate = async (template: Template, setAsActive?: boolean) => {
    console.log("🔍 Demo saveTemplate:", template.name);
    
    // Check if template exists
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      // Update existing
      const updated = [...templates];
      updated[existingIndex] = template;
      setTemplates(updated);
    } else {
      // Add new
      setTemplates([...templates, template]);
    }
    
    if (setAsActive) {
      setActiveTemplateId(template.id);
    }
    
    // If this is being saved for a specific day, store the association
    if (selectedDate) {
      setDayTemplate(selectedDate, template.id);
    }
    
    return template.id;
  };

  const setActiveTemplate = async (templateId: string) => {
    console.log("🔍 Demo setActiveTemplate:", templateId);
    setActiveTemplateId(templateId);
    
    // Store this template choice for the current day
    if (selectedDate) {
      setDayTemplate(selectedDate, templateId);
    }
    
    return templateId;
  };

  const deleteTemplate = async (templateId: string) => {
    console.log("🔍 Demo deleteTemplate:", templateId);
    setTemplates(templates.filter(t => t.id !== templateId));
    
    if (activeTemplateId === templateId) {
      const remaining = templates.filter(t => t.id !== templateId);
      setActiveTemplateId(remaining[0]?.id || null);
    }
  };

  const duplicateTemplate = async (templateId: string, newName?: string) => {
    console.log("🔍 Demo duplicateTemplate:", templateId, newName);
    const template = templates.find(t => t.id === templateId);
    
    if (!template) return null;
    
    const newTemplate: Template = {
      ...template,
      id: `template_${Date.now()}`,
      name: newName || `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTemplates([...templates, newTemplate]);
    return newTemplate.id;
  };

  // Get current form fields (from effective active template or default)
  const getCurrentFormFields = (): TemplateField[] => {
    const effectiveTemplate = getEffectiveActiveTemplate();
    console.log("🔍 Demo getCurrentFormFields - effectiveTemplate:", effectiveTemplate?.name, "fields:", effectiveTemplate?.fields?.length);
    
    if (effectiveTemplate) {
      return effectiveTemplate.fields;
    }
    
    const defaultFields = getDefaultFields();
    console.log("🔍 Demo getCurrentFormFields - using default fields:", defaultFields.length);
    return defaultFields;
  };

  return {
    // Data
    templates,
    activeTemplate: getEffectiveActiveTemplate(),
    currentFormFields: getCurrentFormFields(),
    
    // Loading states
    isLoading,
    
    // Actions
    saveTemplate,
    setActiveTemplate,
    deleteTemplate,
    duplicateTemplate,
    
    // Helpers
    getDefaultFields,
    getEffectiveActiveTemplate,
  };
} 