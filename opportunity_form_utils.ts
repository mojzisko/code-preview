import {
    OPPORTUNITY_MARKET_SEGMENT,
    OPPORTUNITY_INTEREST_RATE_TYPE,
    OPPORTUNITY_PAYMENT_FREQUENCY,
    OPPORTUNITY_TYPE,
    OpportunityPaymentFrequency,
    OpportunityType,
    OpportunityInterestRateType,
    OpportunityMarketSegment,
    OpportunityDeveloperInfo,
} from '@upvestcz/common/opportunities-utils'
import { ReferenceRateType } from '@upvestcz/common/rate-types'
import { Currency, AdminOpportunityQuery } from '@upvestcz/common/graphql/typegen'
import * as yup from 'yup'
import * as R from 'ramda'
import moment from 'moment-timezone'
import { CURRENCIES } from '@upvestcz/common/currency'
import { getFloatingRatesSchema } from '@upvestcz/common/validation/schemas/opportunities'

export type OpportunityFormType = Pick<
    AdminOpportunityQuery['opportunity'],
    | 'address'
    | 'currencies'
    | 'developer_info'
    | 'distribution_fee'
    | 'expected_maturity'
    | 'fundraising_period_end'
    | 'fundraising_period_start'
    | 'ik_fundraising_period_end'
    | 'in_widget'
    | 'interest_rate_type'
    | 'is_private_placement'
    | 'loan_interest_rate'
    | 'market_segment'
    | 'maturity'
    | 'max_fundraising_target'
    | 'max_investment'
    | 'min_fundraising_target'
    | 'min_investment'
    | 'net_value'
    | 'payment_frequency'
    | 'reference_rate_id'
    | 'reference_rate_type'
    | 'report_pdf'
    | 'fees_agreement'
    | 'subtitle'
    | 'subtitle_en'
    | 'text_id'
    | 'title'
    | 'title_en'
    | 'type'
    | 'id'
>

const opportunityCreateFieldsConfig = {
    text_id: {
        initialValue: '',
        validation: yup.string().required('Text Id is required'),
    },
    title: {
        initialValue: '',
        validation: yup.string().required('Title (cz) is required'),
    },
    title_en: {
        initialValue: '',
        validation: yup.string().required('Title (en) is required'),
    },
    subtitle: {
        initialValue: '',
        validation: yup.string().required('Subtitle (cz) is required'),
    },
    subtitle_en: {
        initialValue: '',
        validation: yup.string().required('Subtitle (en) is required'),
    },
    address: {
        initialValue: '',
        validation: yup.string().required('Address is required'),
    },
    loan_interest_rate: {
        initialValue: '',
        validation: yup.number().required('Developer Interest Rate is required'),
    },
    distribution_fee: {
        initialValue: '0.0',
        validation: yup.number().required('KB distribution Fee is required'),
    },
    maturity: {
        initialValue: null,
        validation: yup.date().required('Current Maturity is required'),
    },
    expected_maturity: {
        initialValue: null,
        validation: yup.date().required('Expected (original) Maturity is required'),
    },
    min_fundraising_target: {
        initialValue: '',
        validation: yup.number().required('Min. Fundraising Target is required'),
    },
    max_fundraising_target: {
        initialValue: '',
        validation: yup.number().required('Max. Fundraising Target is required'),
    },
    min_investment: {
        initialValue: '5000',
        validation: yup.number().required('Min. Investment is required'),
    },
    max_investment: {
        initialValue: '5000000',
        validation: yup.number().required('Max. Investment is required'),
    },
    fundraising_period_start: {
        initialValue: moment().format('YYYY-MM-DD HH:mm:ss'),
        validation: yup.date().required('Fundraising Period Start is required'),
    },
    fundraising_period_end: {
        initialValue: null,
        validation: yup.date().required('Fundraising Period End is required'),
    },
    ik_fundraising_period_end: {
        initialValue: null,
        validation: yup.date().nullable(),
    },
    net_value: {
        initialValue: null,
        validation: yup.number().required('Net value is required'),
    },
    report_pdf: {
        initialValue: null,
        validation: yup.string().nullable(),
    },
    fees_agreement: {
        initialValue: null,
        validation: yup.string().nullable(),
    },
    payment_frequency: {
        initialValue: OPPORTUNITY_PAYMENT_FREQUENCY.MONTHLY,
        validation: yup.string().required('Payment Frequency is required'),
    },
    interest_rate_type: {
        initialValue: OPPORTUNITY_INTEREST_RATE_TYPE.SIMPLE,
        validation: yup.string().required('Interest Rate Type is required'),
    },
    currencies: {
        initialValue: [CURRENCIES.CZK],
        validation: yup
            .array()
            .of(
                yup
                    .mixed<Currency>()
                    .oneOf(Object.values(CURRENCIES) as Currency[], 'Invalid currency'),
            )
            .min(1, 'Please choose at least one currency')
            .required(),
    },
    is_private_placement: {
        initialValue: false,
        validation: yup.boolean(),
    },
    in_widget: {
        initialValue: true,
        validation: yup.boolean(),
    },
    market_segment: {
        initialValue: OPPORTUNITY_MARKET_SEGMENT.RESIDENTAL,
        validation: yup.string().required('Market Segment is required'),
    },
    reference_rate_type: {
        initialValue: null,
        validation: yup.string().nullable(),
    },
    reference_rate_id: {
        initialValue: null,
        validation: yup.string().nullable(),
    },
    type: {
        initialValue: OPPORTUNITY_TYPE.UPVEST_LOAN_JUNIOR,
        validation: yup.string().required('Opportunity Type is required'),
    },
    developer_info: {
        initialValue: {
            ico: '',
            name: '',
            markNo: '',
            registeredBy: '',
            address: '',
            logoImage: '',
        },
        validation: yup.object().shape({
            ico: yup.string().required('Developer company ICO is required'),
            name: yup.string().required('Developer company name is required'),
            markNo: yup.string().required('Developer company case number is required'),
            registeredBy: yup.string().required('Developer company registered by is required'),
            address: yup.string().required('Developer company address is required'),
            logoImage: yup.string(),
        }),
    },
}

export const createOrUpdateOpportuntyValidationSchema = yup
    .object()
    .shape(
        R.mapObjIndexed(value => yup.lazy(() => value.validation), opportunityCreateFieldsConfig),
    )
    .concat(getFloatingRatesSchema())

export type OpportunityFormikValues = {
    address: string
    currencies: Array<Currency>
    developer_info: OpportunityDeveloperInfo
    distribution_fee: string
    expected_maturity: Date
    fundraising_period_end: Date
    fundraising_period_start: Date
    ik_fundraising_period_end: Maybe<Date>
    in_widget: boolean
    interest_rate_type: OpportunityInterestRateType
    is_private_placement: boolean
    loan_interest_rate: string
    market_segment: OpportunityMarketSegment
    maturity: Date
    max_fundraising_target: string
    max_investment: string
    min_fundraising_target: string
    min_investment: string
    net_value: string
    payment_frequency: OpportunityPaymentFrequency
    reference_rate_id: number | null
    reference_rate_type: Maybe<ReferenceRateType>
    report_pdf: string | null
    fees_agreement: string | null
    subtitle: string
    subtitle_en: string
    text_id: string
    title: string
    title_en: string
    type: OpportunityType
}

const convertToStringFields = new Set([
    'max_fundraising_target',
    'max_investment',
    'min_fundraising_target',
    'min_investment',
    'net_value',
    'distribution_fee',
    'loan_interest_rate',
])

const convertToDateFields = new Set([
    'fundraising_period_end',
    'fundraising_period_start',
    'maturity',
    'expected_maturity',
    'ik_fundraising_period_end',
])

export const getOpportunityFormInitialValues = (opportunity?: OpportunityFormType) => {
    return R.mapObjIndexed((value, key) => {
        const fieldKey = key as keyof OpportunityFormType
        const fieldValue = opportunity?.[fieldKey]

        if (convertToStringFields.has(key) && fieldValue !== undefined) {
            return fieldValue.toString()
        }

        if (convertToDateFields.has(key) && fieldValue !== undefined) {
            return new Date(fieldValue)
        }

        return fieldValue ?? value.initialValue
    }, opportunityCreateFieldsConfig)
}
