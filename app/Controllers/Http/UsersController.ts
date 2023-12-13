import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'
import CreateUser from 'App/Validators/CreateUserValidator'
import UpdateUser from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    // const userPayload = request.all() // Retorna tudo
    // const userPayload = request.only(['email', 'username', 'password', 'avatar'])
    // if (!userPayload.email || !userPayload.username || !userPayload.password)
    //   throw new BadRequest('provide require data', 422)
    const userPayload = await request.validate(CreateUser)

    const userByEmail = await User.findBy('email', userPayload.email)
    const userByUsername = await User.findBy('username', userPayload.username)

    if (userByEmail) throw new BadRequest('email ja esta em uso', 409)
    if (userByUsername) throw new BadRequest('username ja esta em uso', 409)

    const user = await User.create(userPayload)
    return response.created({ user })
  }

  public async update({ request, response }: HttpContextContract) {
    // const userPayload = request.only(['email', 'avatar', 'password'])
    // const { email, password, avatar } = request.only(['email', 'avatar', 'password'])
    const { email, password, avatar } = await request.validate(UpdateUser)
    // pegando o 'id' passado pela rota
    const id = request.param('id')
    const user = await User.findOrFail(id)

    user.email = email
    user.password = password
    if (avatar) user.avatar = avatar
    await user.save()

    return response.ok({ user })
    // return response.ok({}) // Passar so essa linha pra validar a criacao da rota no teste
  }
}
