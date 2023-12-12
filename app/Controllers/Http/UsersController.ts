import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequest from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    // const userPayload = request.all() // Retorna tudo
    const userPayload = request.only(['email', 'username', 'password', 'avatar'])

    if (!userPayload.email || !userPayload.username || !userPayload.password)
      throw new BadRequest('provide require data', 422)

    const userByEmail = await User.findBy('email', userPayload.email)
    const userByUsername = await User.findBy('username', userPayload.username)

    if (userByEmail) throw new BadRequest('Email ja esta em uso', 409)
    if (userByUsername) throw new BadRequest('username ja esta em uso', 409)

    const user = await User.create(userPayload)
    return response.created({ user })
  }
}
