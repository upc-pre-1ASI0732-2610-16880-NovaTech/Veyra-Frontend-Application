export const environment = {
  production: false,
  platformProviderApiBaseUrl: 'https://veyra-backend-app.azurewebsites.net/api/v1',
  stripePublicKey: 'pk_test_51TSlv2H9VotIcKnvY65C2bj77Mvxdt0GHBoo8y5qPw3WF6qQF80v11nsn4LJ8bxqTGW8sSGlwYrVT3O8XVhy5DcV00YN0I5Wjx',

  // Analytics Bounded Context
  platformProviderAnalyticsStaffTerminationsEndpointPath: '/nursing-homes/{nursingHomeId}/analytics/staff-terminations',
  platformProviderAnalyticsStaffHiresEndpointPath: '/nursing-homes/{nursingHomeId}/analytics/staff-hires',
  platformProviderAnalyticsResidentsAdmissionsEndpointPath: '/nursing-homes/{nursingHomeId}/analytics/residents-admissions',
  platformProviderNursingHomeOccupancyEndpointPath: '/nursing-homes/{nursingHomeId}/dashboard/occupancy',
  platformProviderNursingHomeAlertsEndpointPath: '/nursing-homes/{nursingHomeId}/dashboard/alerts',

  // Hcm Bounded Context
  platformProviderContractsEndpointPath: '/contracts',
  platformProviderStaffEndpointPath:'/staff',
  platformProviderStaffMemberContractsEndpointPath:'/staff/{staffMemberId}/contracts',
  platformProviderStaffMemberContractStatusEndpointPath:'/staff/{staffMemberId}/contracts/{contractId}',

  //IAM Bounded Context
  platformProviderSignInEndpointPath: '/authentication/sign-in',
  platformProviderSignUpEndpointPath: '/authentication/sign-up',
  platformProviderAdministratorsEndpointPath: '/administrators',
  platformProviderAdministratorByUserEndpointPath: '/administrators/by-user/{userId}',
  platformProviderMfaSetupEndpointPath: '/authentication/mfa/setup',
  platformProviderMfaEnableEndpointPath: '/authentication/mfa/enable',
  platformProviderMfaDisableEndpointPath: '/authentication/mfa/disable',
  platformProviderMfaVerifyEndpointPath: '/authentication/mfa/verify',
  platformProviderMfaSmsSetupEndpointPath: '/authentication/mfa/sms/setup',
  platformProviderMfaStatusEndpointPath: '/authentication/mfa/status',

  // Payments Bounded Context
  platformProviderPlansEndpointPath: '/plans',
  platformProviderUserSubscriptionsEndpointPath: '/users/{userId}/subscriptions',
  platformProviderUserActiveSubscriptionEndpointPath: '/users/{userId}/subscriptions/active',
  platformProviderSubscriptionCancelEndpointPath: '/users/{userId}/subscriptions/{subscriptionId}/cancel',
  platformProviderPaymentEndpointPath: '/payments/{paymentId}',
  platformProviderSubscriptionPaymentsEndpointPath: '/subscriptions/{subscriptionId}/payments',

  // Activities Bounded Context
  platformProviderNursingHomeActivitiesEndpointPath: '/nursing-homes/{nursingHomeId}/activities',

  // Questions Bounded Context
  platformProviderNursingHomeQuestionsEndpointPath: '/nursing-homes/{nursingHomeId}/questions',
  platformProviderRelativesEndpointPath: '/relatives',
  platformProviderRelativeQuestionsEndpointPath: '/relatives/{relativeId}/questions',

  // Nursing Bounded Context
  platformProviderResidentVitalSigsEndpointPath: '/resident/{residentId}/vital-signs',
  platformProviderDevicesEndpointPath: '/devices',
  platformProviderResidentAllergiesEndpointPath: '/residents/{residentId}/allergies',
  platformProviderAdministratorNursingHomesEndpointPath: '/administrators/{administratorId}/nursing-homes',
  platformProviderResidentRoomsEndpointPath: '/residents/{residentId}/room',
  platformProviderNursingHomeMedicationsEndpointPath: '/nursing-homes/{nursingHomeId}/medications',
  platformProviderMedicationAdministrationsEndpointPath: '/residents/{residentId}/medications/{medicationId}/administrations',
  platformProviderNursingHomeResidentsEndpointPath: '/nursing-homes/{nursingHomeId}/residents',
  platformProviderNursingHomeStaffEndpointPath: '/nursing-homes/{nursingHomeId}/staff',
  platformProviderNursingHomeRoomsEndpointPath: '/nursing-homes/{nursingHomeId}/rooms',
  platformProviderMedicationsEndpointPath:'/medications',
  platformProviderNursingHomesEndpointPath:'/nursing-homes',
  platformProviderResidentsEndpointPath:'/residents',
  platformProviderRoomsEndpointPath: '/rooms',

  // Profiles Bounded Context
  platformProviderBusinessProfilesEndpointPath: '/business-profiles',
  platformProviderPersonProfilesEndpointPath: '/person-profiles',
};
