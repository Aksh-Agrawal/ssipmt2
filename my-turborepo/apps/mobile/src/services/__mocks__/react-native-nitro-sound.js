export const AudioRecorder = {
  startRecorder: jest.fn(() => Promise.resolve()),
  stopRecorder: jest.fn(() => Promise.resolve()),
  onProgress: jest.fn(),
};

export const AudioPlayer = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
}));