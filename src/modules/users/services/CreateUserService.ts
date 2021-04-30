import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import User from '../infra/typeorm/entities/User';
import IUsersRepository from '../repositories/IUsersRepository';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';

import * as Yup from 'yup';

interface IRequest {
  name: string;
  email: string;
  password: string;
}

@injectable()
class CreateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  public async execute({ name, email, password }: IRequest): Promise<User> {
    try {
      const schema = Yup.object().shape({
        name: Yup.string()
          .matches(/\s{1,}/, 'Name without lastname.')
          .required('Name is required.'),
        email: Yup.string()
          .required('Email is required.')
          .email('Email must be a valid format.'),
        password: Yup.string()
          .required('Password is required.')
          .min(6, 'Password must be have a 6 digits.'),
      });

      await schema.validate(
        { name, email, password },
        {
          abortEarly: false,
        },
      );
    } catch (err) {
      throw new AppError(err.errors);
    }

    const checkUsersExits = await this.usersRepository.findByEmail(email);

    if (checkUsersExits) {
      throw new AppError('Email address already used.');
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    const user = await this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return user;
  }
}

export default CreateUserService;
