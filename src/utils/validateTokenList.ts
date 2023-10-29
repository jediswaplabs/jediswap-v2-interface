import type { TokenInfo, TokenList } from '@uniswap/token-lists';
import type { ValidateFunction } from 'ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import jsonSchema from '@uniswap/token-lists/dist/tokenlist.schema.json';

const tokenListAjv = new Ajv({ code: { source: true, esm: true } });
addFormats(tokenListAjv);
const tokenListValidator = tokenListAjv.compile(jsonSchema);

const tokensAjv = new Ajv({ code: { source: true, esm: true } });
addFormats(tokensAjv);
const tokensValidator = tokensAjv.compile({ ...jsonSchema, required: ['tokens'] });

const ValidationSchemaLookup = {
  LIST: 'list',
  TOKENS: 'tokens',
};

function getValidationErrors(validator: ValidateFunction): string {
  return (
    validator?.errors?.map((error) => [error.instancePath, error.message].filter(Boolean).join(' ')).join('; ')
    ?? 'unknown error'
  );
}

function validate(schemaType: string, data: unknown): any {
  let validator;
  switch (schemaType) {
    case ValidationSchemaLookup.LIST:
      validator = tokenListValidator;
      break;
    case ValidationSchemaLookup.TOKENS:
      validator = tokensValidator;
      break;
    default:
      throw new Error('No validation function specified for token list schema');
  }

  if (validator?.(data)) {
    return data;
  }
  throw new Error(getValidationErrors(validator));
}

/**
 * Validates an array of tokens.
 * @param json the TokenInfo[] to validate
 */
export function validateTokens(json: TokenInfo[]): TokenInfo[] {
  try {
    validate(ValidationSchemaLookup.TOKENS, { tokens: json });
    return json;
  } catch (error) {
    throw new Error(`Tokens failed validation: ${error.message}`);
  }
}

/**
 * Validates a token list.
 * @param json the TokenList to validate
 */
export function validateTokenList(json: TokenList): TokenList {
  try {
    validate(ValidationSchemaLookup.LIST, json);
    return json;
  } catch (error) {
    throw new Error(`Token list failed validation: ${error.message}`);
  }
}
