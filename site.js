const form = document.querySelector('#story-form')
const story = document.querySelector('#story-text')
const count = document.querySelector('#story-count')
const confirmation = document.querySelector('.story-confirmation')

story.addEventListener('input', () => {
  count.textContent = `${story.value.length} / ${story.maxLength}`
  story.setCustomValidity('')
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  if (!story.value.trim()) {
    story.setCustomValidity('Расскажите короткую историю.')
    story.reportValidity()
    return
  }

  form.hidden = true
  confirmation.hidden = false
  confirmation.focus()
})

const chatForm = document.querySelector('.phone-input')
const chatInput = chatForm.querySelector('input')
const chatSend = chatForm.querySelector('button')
const chatMessages = document.querySelector('.messages')
const chatTime = document.querySelector('.phone-status strong').textContent
const chatStatus = document.querySelector('.phone-header small')
const chatSubtitle = chatStatus.textContent
const neighborReplies = [
  {
    topic: /^(сол[ьи]$|солью$|солонк|посол|щепотк)/,
    replies: [
      { name: 'Лена', text: 'Есть, я дома. Могу занести.' },
      { name: 'Сергей', text: 'Есть соль. И лавровый лист, если нужно.' },
    ],
  },
  {
    topic: /^(дрел|сверл|просверл|засверл|ремонт|перфоратор|обо[ия]|полк|бабуш)/,
    replies: [
      { name: 'Марина', text: 'Если будете сверлить, напишите. У меня созвон в десять.' },
      { name: 'Зоя Петровна', text: 'Я тоже с полки начала. Теперь обои выбираю.' },
      { name: 'Дима', text: 'Шо, опять?', sticker: { file: 'chat-meme-again.jpg', alt: 'Удивлённый волк из мультфильма «Жил-был пёс»' } },
    ],
  },
  {
    topic: /^(музык|пес(?:н|ен)|плейлист|колонк|громк|бас[аы]?$|трек|припев|(?:по)?тише$|убав|шум|звук)/,
    replies: [
      { name: 'Лена', text: 'Если у нас громко, пишите. Убавлю.' },
      { name: 'Сергей', text: 'Вчера припев через стену выучил. А песня как называется?' },
    ],
  },
  {
    topic: /^(шкаф|переез|переех|перестанов|мебел|диван|комод|подвин)/,
    replies: [
      { name: 'Марина', text: 'Если нужна помощь, я вечером дома.' },
      { name: 'Сергей', text: 'Мой шкаф до пятого так и не доехал.' },
      { name: 'Дима', text: 'Это фиаско, братан.', sticker: { file: 'chat-meme-fiasco.jpg', alt: 'Сиба-ину Стив в солнечных очках' } },
    ],
  },
  {
    topic: /^(кот(?:а|у|ом|е|ы|ов|ам|ами|ах)?$|кот[яё]|кошк|кошеч|собак|п[её]с$|питом)/,
    replies: [
      { name: 'Лена', text: 'Если нужно присмотреть за хвостатым, пишите.' },
      { name: 'Зоя Петровна', text: 'Ваш хвостатый ко мне уже ходит на второй завтрак.' },
    ],
  },
  {
    topic: /^(пирог|пирож|угощ|угост|выпеч|печень)/,
    replies: [
      { name: 'Лена', text: 'Если нужны яблоки, могу принести.' },
      { name: 'Зоя Петровна', text: 'Я в воскресенье пеку с вишней. Заходите на чай.' },
      { name: 'Сергей', text: 'Если останется, придержите кусочек до семи.' },
    ],
  },
  {
    topic: /^(привет|здравствуй|здраствуй|добр(?:ое|ый|ого|ой)$)/,
    replies: [
      { name: 'Марина', text: 'Привет! Как дела, соседи?' },
      { name: 'Лена', text: 'Привет! Я тут недавно, давайте знакомиться.' },
      { name: 'Зоя Петровна', text: 'Здравствуйте! Если будете мимо, заходите на чай.' },
    ],
  },
]
const generalReplies = [
  { name: 'Марина', text: 'Я только открыла чат. Что пропустила?' },
  { name: 'Дима', text: 'С нашим домовым чатом и сериалы не нужны.' },
  { name: 'Лена', text: 'Если нужна помощь, я на связи.' },
  { name: 'Зоя Петровна', text: 'Заглядывайте на чай, если будете рядом.' },
  { name: 'Сергей', text: 'Да уж, у нас тут всякое бывает.' },
]
const nextReplyIndexes = new Map()

const appendChatMessage = ({ name, text, sticker }, className) => {
  const message = document.createElement('li')
  message.className = className
  const author = document.createElement('b')
  author.textContent = name
  const body = document.createElement('p')
  body.textContent = text
  const time = document.createElement('time')
  time.textContent = chatTime

  message.append(author)
  if (sticker) {
    const card = document.createElement('div')
    card.className = 'message-sticker'
    const image = document.createElement('img')
    image.src = `assets/${sticker.file}`
    image.alt = sticker.alt
    card.append(image, body)
    message.append(card)
  } else {
    message.append(body)
  }
  message.append(time)
  chatMessages.append(message)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

chatInput.addEventListener('input', () => chatInput.setCustomValidity(''))

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const text = chatInput.value.trim()
  if (!text || chatSend.disabled) return
  if (text.split(/\s+/).length > 7) {
    chatInput.setCustomValidity('Максимум семь слов.')
    chatInput.reportValidity()
    return
  }

  const words = text.toLowerCase().match(/[а-яё]+/g) ?? []
  const scenario = neighborReplies.find(({ topic }) => words.some((word) => topic.test(word)))
  const replies = scenario?.replies ?? generalReplies
  let replyIndex = nextReplyIndexes.get(replies) ?? 0
  const previousAuthor = chatMessages.querySelector('.message-reply b')?.textContent
  if (replies[replyIndex].name === previousAuthor) {
    replyIndex = (replyIndex + 1) % replies.length
  }
  const reply = replies[replyIndex]
  nextReplyIndexes.set(replies, (replyIndex + 1) % replies.length)
  chatMessages.querySelectorAll('.message-outgoing, .message-reply').forEach((message) => message.remove())
  appendChatMessage({ name: 'Вы', text }, 'message-outgoing')
  chatForm.reset()
  chatInput.focus({ preventScroll: true })
  chatSend.disabled = true
  chatStatus.textContent = 'Соседи печатают…'

  await new Promise((resolve) => setTimeout(resolve, 650))
  appendChatMessage(reply, 'message-reply')

  chatStatus.textContent = chatSubtitle
  chatSend.disabled = false
})
chatForm.hidden = false

const stage = document.querySelector('.plan-stage')
const player = stage.querySelector('.plan-toggle')
const audio = stage.querySelector('audio')
const playerTitle = stage.querySelector('.player-title')
const progress = stage.querySelector('.player-progress')
const knob = stage.querySelector('.player-knob')
const trackWidth = Number(stage.querySelector('.player-track').getAttribute('width'))
const knobStart = Number(knob.getAttribute('x'))
const playerError = document.querySelector('.player-error')
const playlist = [
  { title: 'Соседская волна', source: audio.getAttribute('src') },
  { title: 'Соло на дрели', source: 'assets/drill-solo.mp3' },
  { title: 'Танцы со шкафом', source: 'assets/wardrobe-dance.mp3' },
]
let trackIndex = 0
let progressFrame

const paintProgress = () => {
  const fraction = Number.isFinite(audio.duration) && audio.duration > 0
    ? audio.currentTime / audio.duration
    : 0
  const distance = fraction * trackWidth
  progress.setAttribute('width', distance)
  knob.setAttribute('x', knobStart + distance)

  if (!audio.paused) progressFrame = requestAnimationFrame(paintProgress)
}

const updatePlayer = () => {
  cancelAnimationFrame(progressFrame)
  stage.classList.toggle('is-playing', !audio.paused)
  const action = audio.paused ? 'Воспроизвести' : 'Приостановить'
  player.setAttribute('aria-label', `${action} «${playlist[trackIndex].title}»`)
  paintProgress()
}

const playTrack = async () => {
  playerError.hidden = true
  try {
    await audio.play()
  } catch (error) {
    if (error.name === 'AbortError') return
    playerError.textContent = 'Не удалось включить звук.'
    playerError.hidden = false
  }
}

const selectTrack = (index) => {
  if (index === trackIndex) return

  trackIndex = index
  playerTitle.textContent = playlist[index].title
  stage.classList.remove('is-sounding')
  audio.src = playlist[index].source
  audio.load()
  updatePlayer()
}

player.addEventListener('click', () => {
  if (audio.paused) playTrack()
  else audio.pause()
})

audio.addEventListener('playing', () => stage.classList.add('is-sounding'))
for (const event of ['pause', 'ended', 'waiting', 'emptied']) {
  audio.addEventListener(event, () => stage.classList.remove('is-sounding'))
}
for (const event of ['play', 'pause']) {
  audio.addEventListener(event, updatePlayer)
}
audio.addEventListener('ended', () => selectTrack((trackIndex + 1) % playlist.length))
player.hidden = false

const heart = document.querySelector('.apartment-heart')
heart.addEventListener('click', () => {
  heart.setAttribute('aria-pressed', String(heart.getAttribute('aria-pressed') !== 'true'))
})

document.querySelectorAll('[data-dialog]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.dialog).showModal()
  })
})

const faq = document.querySelector('.answers')

if (CSS.supports('selector(::details-content)')) {
  const questions = Array.from(faq.querySelectorAll('details'), (detail) => ({
    detail,
    summary: detail.querySelector('summary'),
    answer: detail.querySelector('.faq-answer p'),
  }))

  const reserveFaqSpace = () => {
    let closedHeight = 0
    let tallestAnswer = 0

    for (const { detail, summary, answer } of questions) {
      const style = getComputedStyle(detail)
      closedHeight += summary.getBoundingClientRect().height
        + parseFloat(style.paddingBlockStart) + parseFloat(style.paddingBlockEnd)
        + parseFloat(style.borderBlockStartWidth) + parseFloat(style.borderBlockEndWidth)
      tallestAnswer = Math.max(tallestAnswer, answer.getBoundingClientRect().height)
    }

    // The FAQ can show one answer at a time. Keep the following content below its tallest state.
    faq.style.setProperty('--faq-reserved-height', `${Math.ceil(closedHeight + tallestAnswer)}px`)
  }

  reserveFaqSpace()
  const faqObserver = new ResizeObserver(reserveFaqSpace)
  for (const { summary, answer } of questions) {
    faqObserver.observe(summary)
    faqObserver.observe(answer)
  }
}

if ('IntersectionObserver' in window) {
  const threshold = 0.14
  const motionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < threshold) continue
      entry.target.classList.add('is-in-view')
      motionObserver.unobserve(entry.target)
    }
  }, { threshold })

  document.querySelectorAll('[data-motion]').forEach((scene) => motionObserver.observe(scene))
}
