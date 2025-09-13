/**
 * Newsletter Styling Extension for TipTap
 * Applies consistent styling to newsletter content elements
 */

import { Extension } from '@tiptap/core';

export interface NewsletterOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    newsletter: {
      /**
       * Apply newsletter styling to the current selection
       */
      applyNewsletterStyling: () => ReturnType;
    };
  }
}

export const Newsletter = Extension.create<NewsletterOptions>({
  name: 'newsletter',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'newsletter-content',
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['heading'],
        attributes: {
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              const level = attributes.level;
              const hasEmoji = /^[🌟📊🔍⚠️🎯📈💡🚀📰🔥]/.test(element?.textContent || '');
              
              let classes = 'newsletter-heading';
              
              if (level === 1) {
                classes += ' text-3xl font-bold mb-6 text-gray-900 dark:text-white';
              } else if (level === 2) {
                classes += hasEmoji 
                  ? ' text-2xl font-bold mb-6 mt-8 text-blue-600 dark:text-blue-400 flex items-center gap-3'
                  : ' text-2xl font-bold mb-4 mt-6 text-gray-800 dark:text-gray-200';
              } else if (level === 3) {
                classes += hasEmoji
                  ? ' text-xl font-semibold mb-4 mt-6 text-red-600 dark:text-red-400 flex items-center gap-2'
                  : ' text-xl font-semibold mb-3 mt-5 text-gray-700 dark:text-gray-300';
              } else {
                classes += ' text-lg font-medium mb-2 mt-4 text-gray-600 dark:text-gray-400';
              }
              
              return { class: classes };
            },
          },
        },
      },
      {
        types: ['paragraph'],
        attributes: {
          class: {
            default: 'newsletter-paragraph mb-4 leading-relaxed text-gray-700 dark:text-gray-300',
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              return { class: attributes.class || 'newsletter-paragraph mb-4 leading-relaxed text-gray-700 dark:text-gray-300' };
            },
          },
        },
      },
      {
        types: ['bulletList', 'orderedList'],
        attributes: {
          class: {
            default: 'newsletter-list my-4 ml-6 space-y-2',
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              return { class: attributes.class || 'newsletter-list my-4 ml-6 space-y-2' };
            },
          },
        },
      },
      {
        types: ['listItem'],
        attributes: {
          class: {
            default: 'newsletter-list-item text-gray-700 dark:text-gray-300',
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              return { class: attributes.class || 'newsletter-list-item text-gray-700 dark:text-gray-300' };
            },
          },
        },
      },
      {
        types: ['blockquote'],
        attributes: {
          class: {
            default: 'newsletter-blockquote border-l-4 border-blue-400 pl-4 py-2 my-6 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 italic',
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              return { class: attributes.class || 'newsletter-blockquote border-l-4 border-blue-400 pl-4 py-2 my-6 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 italic' };
            },
          },
        },
      }
    ];
  },

  addCommands() {
    return {
      applyNewsletterStyling:
        () =>
        ({ commands }) => {
          // Apply newsletter-specific styling commands
          console.log('🎨 Applying newsletter styling...');
          
          // This would contain logic to format the current document
          // For now, it's a placeholder for future enhancements
          
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-n': () => this.editor.commands.applyNewsletterStyling(),
    };
  },
});

console.log('📰 Newsletter TipTap extension loaded');