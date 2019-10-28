import React from 'react'

const ModulesContext = React.createContext({
  status: '', // loading, success, error
  modules: {}
})

export default ModulesContext
export const ModulesProvider = ModulesContext.Provider
export const ModulesConsumer = ModulesContext.Consumer