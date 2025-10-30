/**
 * Demo Templates Hook
 * Replaces Convex templates hook with demo store
 */

import { useDemoTemplatesStore } from "../stores/demoTemplatesStore";
import { useState, useMemo, useEffect } from "react";
import { TemplateField } from "@/app/dashboard/_components/Templates";
import { DEMO_TEMPLATES } from "@/data/demoTemplates";

interface UseTemplatesOptions {
  userId?: string;
  selectedDate?: string;
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  console.log("🚀 useTemplates.tsx CALLED!", options);
  
  const { activeTemplateId, setActiveTemplateId } = useDemoTemplatesStore();
  const [isLoading, setIsLoading] = useState(false);

  // Use pre-generated templates from data file
  const templates = DEMO_TEMPLATES;

  // Get the active template or first template as default
  const effectiveActiveTemplate = useMemo(() => {
    if (activeTemplateId) {
      const found = templates.find(t => t.id === activeTemplateId);
      if (found) return found;
    }
    return templates[0] || null;
  }, [activeTemplateId, templates]);

  // Return fields from the active template
  const currentFormFields = useMemo(() => {
    const template = effectiveActiveTemplate;
    const fields = template?.fields || [];
    console.log("📋 useTemplates.tsx returning fields:", fields.length, "from template:", template?.name);
    return fields;
  }, [effectiveActiveTemplate]);

  console.log("📊 useTemplates.tsx state:", {
    templatesCount: templates.length,
    activeTemplate: effectiveActiveTemplate?.name,
    currentFormFieldsCount: currentFormFields.length,
    isLoading
  });

  const handleSetActiveTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setActiveTemplateId(templateId);
      console.log("✅ Switched to template:", template.name, "ID:", templateId);
    } else {
      console.error("❌ Template not found:", templateId);
    }
  };

  const saveTemplate = async (template: any, setAsActive: boolean = false) => {
    // Demo mode: no-op for saving templates
    console.log("💾 Demo mode: template save ignored");
  };

  return {
    templates,
    activeTemplate: effectiveActiveTemplate,
    currentFormFields,
    isLoading: false,
    setActiveTemplate: handleSetActiveTemplate,
    saveTemplate,
    deleteTemplate: async () => {},
    duplicateTemplate: async () => {},
    setTemplateForDay: () => {},
    getEffectiveActiveTemplate: () => effectiveActiveTemplate,
    getDefaultFields: () => templates[0]?.fields || [],
  };
}
