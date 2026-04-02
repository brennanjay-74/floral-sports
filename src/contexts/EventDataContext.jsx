import { createContext, useContext } from 'react';

const EventDataContext = createContext(null);

export function EventDataProvider({ value, children }) {
  return <EventDataContext.Provider value={value}>{children}</EventDataContext.Provider>;
}

export function useEventData() {
  return useContext(EventDataContext);
}
