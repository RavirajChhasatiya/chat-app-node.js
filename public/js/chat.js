const socket = io()


//elements
const $messageform = document.querySelector('#message-form')
const $messageformInput = $messageform.querySelector('input')
const $messageformbutton = $messageform.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationmessageTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebartemplate = document.querySelector('#sidebar-template').innerHTML

// option
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {

    //new message element
    const $newMessage = $messages.lastElementChild

    //hight of new message 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible   height
    const visibleHight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})



socket.on('locationMessage', (message) => {

    console.log(message)
    const html = Mustache.render($locationmessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    console.log(room)
    console.log(users)
    const html = Mustache.render($sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageform.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageformbutton.setAttribute('disalble', 'disable')

    const message = e.target.elements.message.value


    socket.emit('sendmessage', message, (error) => {
        $messageformbutton.removeAttribute('disable')
        $messageformInput.value = ''
        $messageformInput.focus()
        if (error) {
            return console.log(error)

        }
        console.log('Message Delievered')

    })
})
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('a geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disable', 'disalbe')
    navigator.geolocation.getCurrentPosition((position) => {
        //  console.log(position)
        socket.emit('sendlocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disable')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})