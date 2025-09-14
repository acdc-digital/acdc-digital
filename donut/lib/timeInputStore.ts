import { create } from 'zustand'

interface TimeInputState {
  // Store the current input buffer for each field
  inputBuffers: { [fieldKey: string]: string }
  
  // Store the display values for each field (what shows in the input)
  displayValues: { [fieldKey: string]: string }
  
  // Store AM/PM values for each time field
  amPmValues: { [fieldKey: string]: 'AM' | 'PM' }
  
  // Actions
  setInputBuffer: (fieldKey: string, value: string) => void
  setDisplayValue: (fieldKey: string, value: string) => void
  setAmPm: (fieldKey: string, value: 'AM' | 'PM') => void
  toggleAmPm: (fieldKey: string) => void
  clearField: (fieldKey: string) => void
  resetField: (fieldKey: string, originalValue: string) => void
}

export const useTimeInputStore = create<TimeInputState>((set) => ({
  inputBuffers: {},
  displayValues: {},
  amPmValues: {},
  
  setInputBuffer: (fieldKey: string, value: string) =>
    set((state) => ({
      inputBuffers: { ...state.inputBuffers, [fieldKey]: value }
    })),
    
  setDisplayValue: (fieldKey: string, value: string) =>
    set((state) => ({
      displayValues: { ...state.displayValues, [fieldKey]: value }
    })),
    
  setAmPm: (fieldKey: string, value: 'AM' | 'PM') =>
    set((state) => ({
      amPmValues: { ...state.amPmValues, [fieldKey]: value }
    })),
    
  toggleAmPm: (fieldKey: string) =>
    set((state) => {
      const current = state.amPmValues[fieldKey] || 'AM'
      return {
        amPmValues: { ...state.amPmValues, [fieldKey]: current === 'AM' ? 'PM' : 'AM' }
      }
    }),
    
  clearField: (fieldKey: string) =>
    set((state) => {
      const newBuffers = { ...state.inputBuffers }
      const newDisplays = { ...state.displayValues }
      delete newBuffers[fieldKey]
      delete newDisplays[fieldKey]
      return {
        inputBuffers: newBuffers,
        displayValues: newDisplays
      }
    }),
    
  resetField: (fieldKey: string, originalValue: string) =>
    set((state) => {
      const newBuffers = { ...state.inputBuffers }
      const newDisplays = { ...state.displayValues }
      delete newBuffers[fieldKey]
      newDisplays[fieldKey] = originalValue
      return {
        inputBuffers: newBuffers,
        displayValues: newDisplays
      }
    })
}))