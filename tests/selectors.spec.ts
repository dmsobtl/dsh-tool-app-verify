import { describe, expect, it } from 'vitest'
import { parseSelector } from '../src/utils/selectors.ts'

describe('parseSelector', () => {
  it('parses role selector with name', () => {
    const result = parseSelector('role:button[name="Submit"]')
    expect(result).toEqual({ kind: 'role', value: 'button', options: { name: 'Submit' } })
  })

  it('parses role selector without name', () => {
    const result = parseSelector('role:heading')
    expect(result).toEqual({ kind: 'role', value: 'heading' })
  })

  it('parses text selector', () => {
    const result = parseSelector('text:Hello World')
    expect(result).toEqual({ kind: 'text', value: 'Hello World' })
  })

  it('parses testid selector', () => {
    const result = parseSelector('testid:my-button')
    expect(result).toEqual({ kind: 'testid', value: 'my-button' })
  })

  it('parses xpath selector with // prefix', () => {
    const result = parseSelector('//div[@class="main"]')
    expect(result).toEqual({ kind: 'xpath', value: '//div[@class="main"]' })
  })

  it('parses xpath selector with xpath: prefix', () => {
    const result = parseSelector('xpath://button[1]')
    expect(result).toEqual({ kind: 'xpath', value: '//button[1]' })
  })

  it('parses CSS selector (default)', () => {
    const result = parseSelector('#submit-btn')
    expect(result).toEqual({ kind: 'css', value: '#submit-btn' })
  })

  it('parses CSS class selector', () => {
    const result = parseSelector('.btn-primary')
    expect(result).toEqual({ kind: 'css', value: '.btn-primary' })
  })

  it('parses complex CSS selector', () => {
    const result = parseSelector('div.container > button:first-child')
    expect(result).toEqual({ kind: 'css', value: 'div.container > button:first-child' })
  })
})
