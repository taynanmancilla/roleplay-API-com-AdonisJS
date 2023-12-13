import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import Hash from '@ioc:Adonis/Core/Hash'

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

// Agrupar varios testes
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
    // assert.equal(body.user.avatar, userPayload.avatar) // Compara o avatar com o avatar do payload
  })
  test('Deve retornar 409 quando o email já estiver em uso', async (assert) => {
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

  test('Deve retornar 409 quando o username já estiver em uso', async (assert) => {
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

  test('Deve retornar 422 quando nao informar dados obrigatorios', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/users').send({}).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('Deve retornar 422 quando informar email invalido', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@',
        username: 'test',
        password: 'test',
      })
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('Deve retornar 422 quando informar senha invalida', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/users')
      .send({
        email: 'test@test.com',
        username: 'test',
        password: 'tes',
      })
      .expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('Deve atualizar um usuario', async (assert) => {
    const { id, password } = await UserFactory.create()
    const email = 'test@test.com'
    const avatar = 'http://urldoavatar.com'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({
        email,
        avatar,
        password,
      })
      .expect(200)

    assert.exists(body.user, 'User undefined') // Dizendo que precisa existir o obj 'user', se nao existir informa o erro 'Userundefined'
    // Verifica se os valores retornados sao iguais aos atualizados
    assert.equal(body.user.email, email)
    assert.equal(body.user.avatar, avatar)
    assert.equal(body.user.id, id)
  })

  test('Deve atualizar a senha do usuario', async (assert) => {
    const user = await UserFactory.create()
    const password = 'test'

    const { body } = await supertest(BASE_URL)
      .put(`/users/${user.id}`)
      .send({
        email: user.email,
        avatar: user.avatar,
        password,
      })
      .expect(200)

    assert.exists(body.user, 'User Undefined')
    assert.equal(body.user.id, user.id)

    await user.refresh()
    assert.isTrue(await Hash.verify(user.password, password))
  })

  test('Deve retornar 422 quando os dados necessários não são fornecidos', async (assert) => {
    const { id } = await UserFactory.create()
    const { body } = await supertest(BASE_URL).put(`/users/${id}`).send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('Deve retornar 422 quando fornecer um email invalido', async (assert) => {
    const { id, password, avatar } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({
        password,
        avatar,
        email: 'test@',
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('Deve retornar 422 quando fornecer uma senha invalida', async (assert) => {
    const { id, email, avatar } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({
        email,
        avatar,
        password: 'tes',
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  test('Deve retornar 422 quando fornecer um avatar invalido', async (assert) => {
    const { id, email, password } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .put(`/users/${id}`)
      .send({
        email,
        password,
        avatar: 'test',
      })
      .expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
