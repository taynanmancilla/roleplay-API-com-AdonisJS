import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Password', (group) => {
  test.only('Deve enviar um email com instrucoes de redefinicao de senha', async (assert) => {
    const user = await UserFactory.create()

    // Ao usar essa trap nao gastamos a cota de email enviando eles
    Mail.trap((message) => {
      assert.deepEqual(message.to, [
        {
          address: user.email,
        },
      ])
      assert.deepEqual(message.from, {
        address: 'no-reply@roleplay.com',
      })
      assert.equal(message.subject, 'Roleplay: Recuperação de Senha')
      assert.include(message.html!, user.username)
    })
    await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: user.email,
        resetPassword: 'url',
      })
      .expect(204)

    Mail.restore()
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
