import {
    createConnectTransport,
} from '@bufbuild/connect-web'
import {
    createPromiseClient
} from '@bufbuild/connect'
import { ElizaService } from '../gen/buf/connect/demo/eliza/v1/eliza_connect.js'
import { IntroduceRequest } from '../gen/buf/connect/demo/eliza/v1/eliza_pb.js'

test('imports ElizaService correctly', () => {
    expect(ElizaService).toBeDefined()
})

test('imports messages correctly', () => {
    expect(IntroduceRequest).toBeDefined()
})

test('creates a promise client', () => {
    const client = createPromiseClient(
        ElizaService,
        createConnectTransport({
            baseUrl: 'https://demo.connect.build',
        })
    )
    expect(client.say).toBeDefined()
    expect(client.introduce).toBeDefined()
})
