const canManageAppointment = (user, appointment, nextStatus) => {
  if (!user || !appointment) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'agent') return Number(appointment.agent_id) === Number(user.id);
  return user.role === 'customer'
    && Number(appointment.user_id) === Number(user.id)
    && appointment.status === 'pending'
    && nextStatus === 'cancelled';
};

const canEditServiceRequest = (user, request) => {
  if (!user || !request) return false;
  if (user.role === 'admin') return true;
  return user.role === 'customer'
    && Number(request.user_id) === Number(user.id)
    && request.status === 'pending';
};

const canViewOwnedRecord = (user, record, ownerField = 'user_id') => {
  if (!user || !record) return false;
  if (user.role === 'admin') return true;
  return Number(record[ownerField]) === Number(user.id);
};

module.exports = { canManageAppointment, canEditServiceRequest, canViewOwnedRecord };
