export default class Currency {
  public name: string = 'EUR'
  public amount: number = 0
  public rate: number = 0
  public source: string = ''
  public updated: number = 0
  public visible: boolean = false
  public shortname: string = ''
  public longname: string = ''
  public flag: string = ''
  public callback: (d: any) => number = (d) => d
}
