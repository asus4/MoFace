

function loadMain() {
    return import('./main') // eslint-disable-line
}

console.time('load')
loadMain().then((main)=>{
    console.timeEnd('load')
    console.log(main)
    main.default()
})
