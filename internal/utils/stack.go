package utils

type Stack struct {
	elements []string
}

func NewStack() *Stack {
	return &Stack{
		elements: make([]string, 0),
	}
}

func (s *Stack) Push(e string) {
	s.elements = append(s.elements, e)
}

func (s *Stack) Pop() string {
	if s.Empty() {
		return ""
	}

	n := len(s.elements) - 1
	data := s.elements[n]
	s.elements = s.elements[:n]
	return data
}

func (s *Stack) Peek() string {
	if s.Empty() {
		return ""
	}
	return s.elements[len(s.elements)-1]
}

func (s *Stack) Size() int {
	return len(s.elements)
}

func (s *Stack) Empty() bool {
	return len(s.elements) == 0
}

func (s *Stack) List() []string {
	return s.elements
}
