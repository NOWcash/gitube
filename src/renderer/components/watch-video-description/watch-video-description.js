import Vue from 'vue'
import FtCard from '../ft-card/ft-card.vue'
import FtTimestampCatcher from '../ft-timestamp-catcher/ft-timestamp-catcher.vue'
import autolinker from 'autolinker'

export default Vue.extend({
  name: 'WatchVideoDescription',
  components: {
    'ft-card': FtCard,
    'ft-timestamp-catcher': FtTimestampCatcher
  },
  props: {
    published: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    descriptionHtml: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      shownDescription: ''
    }
  },
  mounted: function () {
    if (this.descriptionHtml !== '') {
      const parsed = this.parseDescriptionHtml(this.descriptionHtml)

      // the invidious API returns emtpy html elements when the description is empty
      // so we need to parse it to see if there is any meaningful text in the html
      // or if it's just empty html elements e.g. `<p></p>`

      const testDiv = document.createElement('div')
      testDiv.innerHTML = parsed

      if (!/^\s*$/.test(testDiv.innerText)) {
        this.shownDescription = parsed
      }
    } else {
      if (!/^\s*$/.test(this.description)) {
        this.shownDescription = autolinker.link(this.description)
      }
    }
  },
  methods: {
    onTimestamp: function(timestamp) {
      this.$emit('timestamp-event', timestamp)
    },
    parseDescriptionHtml: function (descriptionText) {
      descriptionText = descriptionText.replace(/target="_blank"/g, '')
      descriptionText = descriptionText.replace(/\/redirect.+?(?=q=)/g, '')
      descriptionText = descriptionText.replace(/q=/g, '')
      descriptionText = descriptionText.replace(/rel="nofollow\snoopener"/g, '')
      descriptionText = descriptionText.replace(/class=.+?(?=")./g, '')
      descriptionText = descriptionText.replace(/id=.+?(?=")./g, '')
      descriptionText = descriptionText.replace(/data-target-new-window=.+?(?=")./g, '')
      descriptionText = descriptionText.replace(/data-url=.+?(?=")./g, '')
      descriptionText = descriptionText.replace(/data-sessionlink=.+?(?=")./g, '')
      descriptionText = descriptionText.replace(/&amp;/g, '&')
      descriptionText = descriptionText.replace(/%3A/g, ':')
      descriptionText = descriptionText.replace(/%2F/g, '/')
      descriptionText = descriptionText.replace(/&v.+?(?=")/g, '')
      descriptionText = descriptionText.replace(/&redirect-token.+?(?=")/g, '')
      descriptionText = descriptionText.replace(/&redir_token.+?(?=")/g, '')
      descriptionText = descriptionText.replace(/href="\//g, 'href="https://www.youtube.com/')
      // TODO: Implement hashtag support
      descriptionText = descriptionText.replace(/href="\/hashtag\//g, 'href="freetube://')
      descriptionText = descriptionText.replace(/yt\.www\.watch\.player\.seekTo/g, 'changeDuration')

      return descriptionText
    }
  }
})
