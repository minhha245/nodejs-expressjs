module.exports = {
  users: {
    attributes: {
      email: 'Email',
      password: 'Mật khẩu',
      password_confirm: 'Xác nhận mật khẩu',
      first_name: 'Tên',
      last_name: 'Họ',
      name: 'Họ và tên',
      tel: 'Số điện thoại',
      avatar: 'Ảnh đại diện',
      created_at: 'Ngày tạo',
      updated_at: 'Ngày cập nhật'
    },
    rules: {
      email: ['required', 'email', 'unique:users'],
      password: ['required', 'min:6', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$/'],
      password_confirm: ['required', 'same:password'],
      first_name: ['required', 'string', 'max:50'],
      last_name: ['required', 'string', 'max:50'],
      name: ['required', 'string', 'min:2', 'max:100'],
      tel: ['required', 'regex:/^[0-9]{10,11}$/'],
      avatar: ['file', 'mimes:jpeg,png', 'max:5120']
    }
  },
  // Thêm các model khác ở đây
  posts: {
    attributes: {
      title: 'Tiêu đề',
      content: 'Nội dung',
      author_id: 'Tác giả',
      status: 'Trạng thái',
      published_at: 'Ngày xuất bản'
    },
    rules: {
      title: ['required', 'string', 'min:10', 'max:255'],
      content: ['required', 'string', 'min:100'],
      author_id: ['required', 'exists:users,id'],
      status: ['required', 'in:draft,published,archived'],
      published_at: ['required_if:status,published', 'date']
    }
  }
}; 