import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  // Cria tabela
  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('email').notNullable().unique()
      table.string('username').notNullable().unique()
      table.string('password').notNullable()
      table.string('avatar').defaultTo('') // Pra ajudar o front a lidar com usuario que nao colocam avatar
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }
  // Remove tabela
  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
