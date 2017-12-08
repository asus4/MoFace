// Web-Midi Support
if (navigator.requestMIDIAccess) {
  const onMessage = (msg) => {
    console.log(msg)
  }
  const onStateChange = (msg) => {
    console.log(msg)
  }
  const onSuccess = (midi) => {
    const inputs = midi.inputs.values()
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      console.log(input)
      input.value.onmidimessage = onMessage
      input.value.onstatechange = onStateChange
    }
  }
  const onFail = (err) => {
    console.log(err)
  }
  navigator.requestMIDIAccess().then(onSuccess, onFail)
}
