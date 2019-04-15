Page({
    data: {
        name: "home"
    },
    onLoad() {
        this.timeouts()
    },

    async timeouts() {
        await setTimeout(() => {
            console.log('timeout')
        }, 1000)
    }
})