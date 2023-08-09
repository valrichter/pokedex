import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Pokemon already exists in database ${JSON.stringify(
            error.keyValue,
          )} `,
        );
      }
      console.log(error);
      throw new InternalServerErrorException(
        `Cant create pokemon - Check server logs`,
      );
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    let pokemon: Pokemon;

    //ID
    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id });
    }

    //MongoID
    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
    }

    //Name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: id.toLocaleLowerCase().trim(),
      });
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id ${id} not found `);
    }

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id ${id} not found `);
    }

    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists in database ${JSON.stringify(error.keyValue)} `,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Cant create pokemon - Check server logs`,
    );
  }
}
