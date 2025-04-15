module.exports = {
  users: {
    id: {
      type: 'integer',
      rules: ['required'],
      label: 'ID'
    },
    email: {
      type: 'string',
      rules: ['required', 'email', 'unique:users'],
      label: 'Email'
    },
    password: {
      type: 'string',
      rules: ['required', 'min:8', 'password_strength'],
      label: 'Password'
    },
    name: {
      type: 'string',
      rules: ['required', 'min:2', 'max:50'],
      label: 'Name'
    },
    avatar: {
      type: 'file',
      rules: ['file', 'mimes:jpeg,png,jpg', 'file_max_size:2'],
      label: 'Avatar'
    },
    phone: {
      type: 'string',
      rules: ['tel', 'unique:users'],
      label: 'Phone Number'
    },
    address: {
      type: 'string',
      rules: ['max:255'],
      label: 'Address'
    },
    status: {
      type: 'integer',
      rules: ['required', 'in:0,1'],
      label: 'Status'
    },
    role: {
      type: 'string',
      rules: ['required', 'in:admin,user'],
      label: 'Role'
    },
    email_verified_at: {
      type: 'datetime',
      rules: ['date'],
      label: 'Email Verification Date'
    },
    created_at: {
      type: 'datetime',
      rules: ['date'],
      label: 'Created Date'
    },
    updated_at: {
      type: 'datetime',
      rules: ['date'],
      label: 'Updated Date'
    }
  },
  // Thêm các model khác ở đây
  posts: {
    id: {
      type: 'integer',
      rules: ['required'],
      label: 'ID'
    },
    title: {
      type: 'string',
      rules: ['required', 'min:10', 'max:255'],
      label: 'Title'
    },
    content: {
      type: 'text',
      rules: ['required', 'min:50'],
      label: 'Content'
    },
    thumbnail: {
      type: 'file',
      rules: ['file', 'mimes:jpeg,png,jpg', 'file_max_size:5'],
      label: 'Thumbnail'
    },
    user_id: {
      type: 'integer',
      rules: ['required', 'exists:users,id'],
      label: 'Author'
    },
    status: {
      type: 'integer',
      rules: ['required', 'in:0,1,2'],
      label: 'Status'
    },
    published_at: {
      type: 'datetime',
      rules: ['date'],
      label: 'Published Date'
    },
    created_at: {
      type: 'datetime',
      rules: ['date'],
      label: 'Created Date'
    },
    updated_at: {
      type: 'datetime',
      rules: ['date'],
      label: 'Updated Date'
    }
  }
}; 