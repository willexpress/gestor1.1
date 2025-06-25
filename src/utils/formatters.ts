export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cpf;
};

export const generateRechargeCode = (): string => {
  const length = 16;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    if (i > 0 && i % 4 === 0) {
      result += ' ';
    }
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// Function to format a code string into groups of 4 characters
export const formatCodeString = (codeString: string): string => {
  // Remove all non-alphanumeric characters
  const cleanCode = codeString.replace(/[^a-zA-Z0-9]/g, '');
  
  // Split into groups of 4 characters
  const groups = [];
  for (let i = 0; i < cleanCode.length; i += 4) {
    groups.push(cleanCode.slice(i, i + 4));
  }
  
  // Join with spaces and convert to uppercase
  return groups.join(' ').toUpperCase();
};