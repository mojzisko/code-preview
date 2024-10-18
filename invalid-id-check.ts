import convert from 'xml-js'
import * as R from 'ramda'
import fetch from 'node-fetch'
import moment from 'moment-timezone'
import { DOCUMENT_CHECK_TYPES } from '@upvestcz/common/account-utils'
import { OPERATING_TIMEZONE } from '@upvestcz/common/constants'
import { DocumentCheckError } from '@upvestcz/common/errors'

type InvalidDocumentCheckSuccessResponse = {
    doklady_neplatne: {
        _attributes: {
            posl_zmena: string // DD.MM.YYYY
            pristi_zmeny: string
        }
        dotaz: {
            _attributes: {
                typ: string
                cislo: string
                serie: string
            }
        }
        odpoved: {
            _attributes: {
                aktualizovano: string // DD.MM.YYYY
                evidovano: 'ano' | 'ne'
                evidovano_od: string // DD.MM.YYYY
            }
        }
    }
}

type InvalidDocumentCheckErrorResponse = {
    doklady_neplatne: {
        _attributes: {
            posl_zmena: string // DD.MM.YYYY
            pristi_zmeny: string
        }
        chyba: {
            spatny_dotaz: 'ano' | 'ne'
            _text: string
        }
    }
}

type InvalidDocumentCheckResponse = XOR<
    InvalidDocumentCheckSuccessResponse,
    InvalidDocumentCheckErrorResponse
>

const regexes = {
    op: /^[1-9]\d{8}$/,
    ops: /^[A-Z]{2}\d{0,2}\s?\d{6}$/,
    cp: /^[1-9]\d{7}$/,
    zp: /^[A-Z]{2}\s?\d{6}$/,
}

const isCzechIdDocumentNumberFormat = (idNumber: string) =>
    R.anyPass(R.values(regexes).map(regex => R.test(regex)))(idNumber.toUpperCase())

const isTypeAbleToValidateIdDocumentType = (
    idType: string,
): idType is keyof typeof DOCUMENT_CHECK_TYPES => Object.keys(DOCUMENT_CHECK_TYPES).includes(idType)

/**
 * Checks id number with id type against mvcr's database.
 * Should fail for this one:
 *  number: 200436652
 *  type: 0
 *
 * more examples: https://aplikace.mvcr.cz/neplatne-doklady/
 */
export const invalidIdDocumentCheck = async ({
    number,
    type,
}: {
    number: string
    type: string
}): Promise<XOR<{ isValid: true }, { isValid: false; invalidFrom: Date }>> => {
    if (isTypeAbleToValidateIdDocumentType(type) && isCzechIdDocumentNumberFormat(number)) {
        const res = await fetch(
            `https://aplikace.mvcr.cz/neplatne-doklady/doklady.aspx?dotaz=${number}&doklad=${DOCUMENT_CHECK_TYPES[type]}`,
        )

        const xml = await res.text()

        const { doklady_neplatne } = JSON.parse(
            convert.xml2json(xml, { compact: true, spaces: 2 }),
        ) as InvalidDocumentCheckResponse

        if ('chyba' in doklady_neplatne) {
            // eslint-disable-next-line no-underscore-dangle
            throw new DocumentCheckError(doklady_neplatne.chyba._text)
        }

        // eslint-disable-next-line no-underscore-dangle
        const { evidovano, evidovano_od } = doklady_neplatne.odpoved._attributes

        return evidovano === 'ano'
            ? {
                  isValid: false,
                  invalidFrom: moment(evidovano_od, 'DD.MM.YYYY')
                      .tz(OPERATING_TIMEZONE, true)
                      .toDate(),
              }
            : { isValid: true }
    }

    // if we cannot verify the document, we assume it is valid to not block proceeding in the registration.
    return { isValid: true }
}
