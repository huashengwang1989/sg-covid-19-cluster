import React from 'react'

import { useMyHook } from 'sg-covid'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App
