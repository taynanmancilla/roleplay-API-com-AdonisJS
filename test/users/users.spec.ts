import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

/*
  {
    "users": {
      "id": number,
      "email": string,
      "username": string,
      "password": string,
      "avatar": string
    }
  }
*/
test.group('User', (group) => {
  // Usando o 'Only' somente esse teste executa
  test('Deve criar um usuario', async (assert) => {
    // Criando o corpo da requisicao(conjunto de informacoes que pertencem ao usuario)
    const userPayload = {
      email: 'test@test.com',
      username: 'test',
      password: 'test',
      avatar: 'http://urldaimagem',
    }
    const { body } = await supertest(BASE_URL).post('/users').send(userPayload).expect(201)
    assert.exists(body.user, 'User Undefined') // Se nao retornar usuario da esse erro
    assert.exists(body.user.id, 'ID Undefined') // Se nao retornar ID da esse erro
    assert.equal(body.user.email, userPayload.email) // Compara o email com o email do payload
    assert.equal(body.user.username, userPayload.username) // Compara o username com o username do payload
    assert.notExists(body.user.password, 'Password Defined') // Compara o password com o password do payload
    assert.equal(body.user.avatar, userPayload.avatar) // Compara o avatar com o avatar do payload
  })
  test('Deve retornar 409 quando o e-mail já estiver em uso', async (assert) => {
    const { email } = await UserFactory.create()
    // eslint-disable-next-line prettier/prettier
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email,
        username: 'test',
        password: 'test',
      })
      .expect(409)

    assert.include(body.message, 'email')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  test.only('Deve retornar 409 quando o username já estiver em uso', async (assert) => {
    const { username } = await UserFactory.create()
    // eslint-disable-next-line prettier/prettier
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@test.com',
        username,
        password: 'test',
      })
      .expect(409)

    assert.include(body.message, 'username')
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 409)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
}) // Agrupar varios testes
