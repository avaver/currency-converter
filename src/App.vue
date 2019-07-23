<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="subheading text-uppercase">
        <span>Currency</span>
        <span class="font-weight-light">Converter</span>
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="dialogSettings = true">
        <v-icon>settings</v-icon>
      </v-btn>
    </v-toolbar>

    <v-content>
      <v-container fluid>
        <v-layout align-center justify-center>
          <v-flex xs12 md6 lg3>
            <v-card>
              <v-card-text>
                <template v-for="c in visible">
                  <v-layout row :key="c.name" align-baseline>
                    <v-flex xs2>
                      <v-avatar size="28px"><img :src="c.flag"/></v-avatar>
                    </v-flex>
                    <v-flex xs8>
                      <v-text-field type="text" v-show="c.visible" inputmode="decimal"
                        :label="c.name" v-model="c.amount"
                        :error-messages="getOutdatedWarning(c.updated)"
                        @focus="$event.target.setSelectionRange(0, $event.target.value.length)"
                        @input="onInput(c.name)">
                      </v-text-field>
                    </v-flex>
                    <v-flex xs2 justify-end>
                      <v-btn icon v-show="c.name !== baseCurrency" @click="hide(c.name)"><v-icon>close</v-icon></v-btn>
                    </v-flex>
                  </v-layout>
                </template>
              </v-card-text>
              <v-card-text>
                <v-btn color="pink" dark fab bottom right absolute @click="dialogAdd = true" v-show="hidden.length > 0">
                  <v-icon>add</v-icon>
                </v-btn>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>

        <v-dialog v-model="dialogAdd" max-width="500px" scrollable>
          <v-card>
            <v-card-title><span class="subheading">Select Currencies</span></v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-list two-line>
                <v-list-tile avatar ripple v-for="c in hidden" :key="c.name" @click="show(c.name)" v-show="!c.visible">
                  <v-list-tile-avatar><img :src="c.flag"/></v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title>{{c.longname}}</v-list-tile-title>
                    <v-list-tile-sub-title>{{getBaseRateString(c.name)}}</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-list-tile-action-text>{{c.name}}</v-list-tile-action-text>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat color="primary" @click="dialogAdd = false">Done</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogSettings" max-width="500px" scrollable>
          <v-card>
            <v-card-title><span class="subheading">Base Currency</span></v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-list>
                <v-list-tile avatar ripple v-for="c in visible" :key="c.name" @click="saveBase(c.name)">
                  <v-list-tile-avatar><img :src="c.flag"/></v-list-tile-avatar>
                  <v-list-tile-content>
                    <v-list-tile-title><span :class="[c.name === baseCurrency ? 'red--text text--darken-4 font-weight-bold' : '']">{{c.longname}}</span></v-list-tile-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-list-tile-action-text>{{c.name}}</v-list-tile-action-text>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-card-text>
          </v-card>
        </v-dialog>

      </v-container>
    </v-content>
    
    <v-footer justify-center app>
      <v-flex text-xs-center v-for="c in visible" :key="c.name" v-show="c.name !== baseCurrency">{{getTargetRateString(c.name)}}</v-flex>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Currency from './currency'

@Component
export default class App extends Vue {
  private dialogAdd = false
  private dialogSettings = false

  private CACHE_PREFIX = 'cache_'
  private MAX_AGE = 1000 * 60 * 60

  private baseCurrency = 'EUR'

  private currencies: Currency[] = [
    { name: 'EUR', rate: 1, amount: 0, updated: 9561569151319, visible: true, shortname: '€', longname: 'Euro',
      source: '', callback: (d) => d,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/eu.svg' },
    { name: 'USD', rate: 0, amount: 0, updated: 0, visible: true, shortname: '$', longname: 'US Dollar',
      source: 'https://api.exchangeratesapi.io/latest?symbols=USD', callback: (d) => d.rates.USD,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/us.svg' },
    { name: 'DKK', rate: 0, amount: 0, updated: 0, visible: true, shortname: 'kr', longname: 'Danish Krone',
      source: 'https://api.exchangeratesapi.io/latest?symbols=DKK', callback: (d) => d.rates.DKK,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/dk.svg' },
    { name: 'NOK', rate: 0, amount: 0, updated: 0, visible: true, shortname: 'kr', longname: 'Norwegian Krone',
      source: 'https://api.exchangeratesapi.io/latest?symbols=NOK', callback: (d) => d.rates.NOK,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/no.svg' },
    { name: 'PLN', rate: 0, amount: 0, updated: 0, visible: true, shortname: 'zł', longname: 'Polish Zloty',
      source: 'https://api.exchangeratesapi.io/latest?symbols=PLN', callback: (d) => d.rates.PLN,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/pl.svg' },
    { name: 'HRK', rate: 0, amount: 0, updated: 0, visible: true, shortname: 'kn', longname: 'Croatian Kuna',
      source: 'https://api.exchangeratesapi.io/latest?symbols=HRK', callback: (d) => d.rates.HRK,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/hr.svg' },
    { name: 'HUF', rate: 0, amount: 0, updated: 0, visible: true, shortname: 'ft', longname: 'Hungarian Forint',
      source: 'https://api.exchangeratesapi.io/latest?symbols=HUF', callback: (d) => d.rates.HUF,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/hu.svg' },
    { name: 'RON', rate: 0, amount: 0, updated: 0, visible: true, shortname: 'lei', longname: 'Romanian Leu',
      source: 'https://api.exchangeratesapi.io/latest?symbols=RON', callback: (d) => d.rates.RON,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/ro.svg' },
    { name: 'BGN', rate: 0, amount: 0, updated: 0, visible: true, shortname: 'лв', longname: 'Bulgarian Lev',
      source: 'https://api.exchangeratesapi.io/latest?symbols=BGN', callback: (d) => d.rates.BGN,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/bg.svg' },
    { name: 'CAD', rate: 0, amount: 0, updated: 0, visible: true, shortname: '$', longname: 'Canadian Dollar',
      source: 'https://api.exchangeratesapi.io/latest?symbols=CAD', callback: (d) => d.rates.CAD,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/ca.svg' },
    { name: 'UAH', rate: 0, amount: 0, updated: 0, visible: true, shortname: 'грн', longname: 'Ukrainian Hryvna',
      source: 'https://free.currconv.com/api/v7/convert?apiKey=8be7d7ffc4c33276170e&compact=ultra&q=EUR_UAH',
      callback: (d) => d.EUR_UAH,
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.3.0/flags/1x1/ua.svg' },
  ]

  get visible() {
    return this.currencies.filter((c) => c.visible).sort((a, b) => {
      if (a.name === this.baseCurrency) { return -1 }
      if (b.name === this.baseCurrency) { return 1 }
      const x = a.longname.toLowerCase()
      const y = b.longname.toLowerCase()
      if (x < y) { return -1 }
      if (x > y) { return 1 }
      return 0
    })
  }

  get hidden() {
    return this.currencies.filter((c) => !c.visible).sort((a, b) => {
      const x = a.longname.toLowerCase()
      const y = b.longname.toLowerCase()
      if (x < y) { return -1 }
      if (x > y) { return 1 }
      return 0
    })
  }

  private mounted() {
    window.addEventListener('focus', this.updateRates)
    this.updateRates()

    this.restore()
  }

  private restore() {
    this.baseCurrency = window.localStorage.getItem(this.CACHE_PREFIX + 'base') || 'EUR'
    const dc = (window.localStorage.getItem(this.CACHE_PREFIX + 'data') || 'EUR|USD|DKK|NOK|PLN|RON|BGN|UAH').split('|')
    this.currencies.forEach((c) => c.visible = dc.indexOf(c.name) !== -1)
  }

  private save() {
    const displayCurrencies = this.currencies.filter((c) => c.visible).map((c) => c.name).join('|')
    window.localStorage.setItem(this.CACHE_PREFIX + 'data', displayCurrencies)
  }

  private updateRates() {
    this.currencies.forEach((c) => {
      if (c.name !== 'EUR') {
        c.updated = parseInt(window.localStorage.getItem(this.CACHE_PREFIX + c.name + '_ts') || '0', 10)
        c.rate = parseFloat(window.localStorage.getItem(this.CACHE_PREFIX + c.name + '_rate') || '0')
        if (this.outdated(c.updated) || c.rate === 0) {
          fetch(c.source!).then((r) => r.json()).then((d) => {
            c.rate = c.callback!(d)
            c.updated = new Date().valueOf()
            window.localStorage.setItem(this.CACHE_PREFIX + c.name + '_ts', new Date().valueOf().toString())
            window.localStorage.setItem(this.CACHE_PREFIX + c.name + '_rate', c.rate.toString())
          }).catch((e) => console.log(e))
        }
      }
    })
  }

  private onInput(name: string) {
    const currency = this.currencies.find((c) => c.name === name)!
    const amountEur = currency.amount / currency.rate

    this.currencies.forEach((c) => {
      if (c.name !== name) {
        c.amount = Math.round(amountEur * c.rate * 100) / 100
      }
    })
  }

  private hide(name: string) {
    this.currencies.find((c) => c.name === name)!.visible = false
    this.save()
  }

  private show(name: string) {
    this.currencies.find((c) => c.name === name)!.visible = true
    this.save()
    if (this.currencies.filter((c) => !c.visible).length === 0) {
      this.dialogAdd = false
    }
  }

  private saveBase(name: string) {
    this.baseCurrency = name
    window.localStorage.setItem(this.CACHE_PREFIX + 'base', name)
    this.show(name)
    this.dialogSettings = false
  }

  private outdated(ts: number): boolean {
    return (ts + this.MAX_AGE) < new Date().valueOf()
  }

  private getBaseRateString(name: string): string {
    const baseC = this.currencies.find((c) => c.name === this.baseCurrency)!
    const targetC = this.currencies.find((c) => c.name === name)!
    const eurC = this.currencies.find((c) => c.name === 'EUR')!
    return '1' + baseC.shortname + ' = ' + (1 / baseC.rate * targetC.rate).toFixed(4) + targetC.shortname
  }

  private getTargetRateString(name: string): string {
    const baseC = this.currencies.find((c) => c.name === this.baseCurrency)!
    const targetC = this.currencies.find((c) => c.name === name)!
    const eurC = this.currencies.find((c) => c.name === 'EUR')!
    return '1' + targetC.shortname + ' = ' + (1 / targetC.rate * baseC.rate).toFixed(2) + baseC.shortname
  }

  private getOutdatedWarning(ts: number): string[] {
    if (!ts) {
      return ['problem receiving exchange rate']
    } else if (this.outdated(ts)) {
      return ['exchange rate last updated ' + new Date(ts).toLocaleString('en-GB')]
    } else {
      return []
    }
  }
}
</script>