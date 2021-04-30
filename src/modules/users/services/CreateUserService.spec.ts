import AppError from '@shared/errors/AppError';

import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import CreateUserService from './CreateUserService';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let createUser: CreateUserService;

describe('CreateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();
    createUser = new CreateUserService(fakeUsersRepository, fakeHashProvider);
  });

  it('should be able to create a new user with success', async () => {
    const user = await createUser.execute({
      name: 'Aluno Teste',
      email: 'aluno@teste.com',
      password: '12345678',
    });

    expect(user).toHaveProperty('id');
  });

  it('should not create a new user without a lastname', async () => {
    await expect(
      createUser.execute({
        name: 'Aluno',
        email: 'aluno@teste.com',
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not create a new user with bad email format', async () => {
    await expect(
      createUser.execute({
        name: 'Aluno Teste',
        email: 'aluno@teste',
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not create a new user with empty password', async () => {
    await expect(
      createUser.execute({
        name: 'Aluno Teste',
        email: 'aluno@teste',
        password: '',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not to create a user with password less than 6 digits', async () => {
    await expect(
      createUser.execute({
        name: 'Aluno Teste',
        email: 'aluno@teste',
        password: '1234567',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not create a new user with email already registered', async () => {
    await createUser.execute({
      name: 'Aluno Teste',
      email: 'aluno@teste.com',
      password: '12345678',
    });

    await expect(
      createUser.execute({
        name: 'Aluno Teste',
        email: 'aluno@teste.com',
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
